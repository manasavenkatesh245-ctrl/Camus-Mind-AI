import os
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple
import pypdf
from pypdf.errors import PdfReadError
from backend.config import DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP, MAX_UPLOAD_SIZE_MB
from backend.database import get_db

class PDFProcessingError(Exception):
    pass

class PDFService:
    @staticmethod
    def validate_file(file_path: Path, original_filename: str) -> None:
        """Validates file existence, extension, size, and PDF signature."""
        if not file_path.exists():
            raise PDFProcessingError(f"File not found: {file_path}")

        file_size_mb = file_path.stat().st_size / (1024 * 1024)
        if file_size_mb > MAX_UPLOAD_SIZE_MB:
            raise PDFProcessingError(f"File size ({file_size_mb:.1f} MB) exceeds maximum limit of {MAX_UPLOAD_SIZE_MB} MB.")

        if not original_filename.lower().endswith(".pdf"):
            raise PDFProcessingError("Unsupported file type. Only standard PDF (.pdf) documents are accepted.")

        # Validate magic bytes (%PDF-)
        try:
            with open(file_path, "rb") as f:
                header = f.read(5)
                if not header.startswith(b"%PDF-"):
                    raise PDFProcessingError("Invalid file signature. The file is not a valid PDF document.")
        except Exception as e:
            if isinstance(e, PDFProcessingError):
                raise
            raise PDFProcessingError(f"Unable to read file header: {str(e)}")

    @staticmethod
    def extract_text_by_page(file_path: Path) -> Tuple[int, List[Dict[str, Any]], bool]:
        """
        Extracts text page-by-page.
        Returns (total_pages, list of page dicts, is_mostly_scanned).
        """
        pages_content = []
        try:
            reader = pypdf.PdfReader(str(file_path))
            total_pages = len(reader.pages)
            if total_pages == 0:
                raise PDFProcessingError("PDF document contains 0 pages.")

            blank_pages = 0
            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                try:
                    text = page.extract_text() or ""
                    # Normalize whitespace
                    clean_text = re.sub(r'[ \t]+', ' ', text)
                    clean_text = re.sub(r'\n{3,}', '\n\n', clean_text).strip()
                    if not clean_text:
                        blank_pages += 1
                    pages_content.append({
                        "page_number": page_num,
                        "text": clean_text
                    })
                except Exception as e:
                    pages_content.append({
                        "page_number": page_num,
                        "text": f"[Error extracting text from page {page_num}: {str(e)}]"
                    })

            # Check if document appears to be scanned images without OCR
            is_scanned = (blank_pages / total_pages) > 0.6 if total_pages > 0 else False
            return total_pages, pages_content, is_scanned

        except PdfReadError as e:
            raise PDFProcessingError(f"Corrupted or encrypted PDF document: {str(e)}")
        except Exception as e:
            if isinstance(e, PDFProcessingError):
                raise
            raise PDFProcessingError(f"Failed to parse PDF document: {str(e)}")

    @staticmethod
    def chunk_text(pages_content: List[Dict[str, Any]],
                   chunk_size: int = DEFAULT_CHUNK_SIZE,
                   overlap: int = DEFAULT_CHUNK_OVERLAP) -> List[Dict[str, Any]]:
        """
        Splits page text into overlapping chunks, preserving exact page number metadata.
        """
        chunks = []
        global_chunk_idx = 0

        for page in pages_content:
            page_num = page["page_number"]
            text = page["text"]
            if not text or text.startswith("[Error"):
                continue

            # Split text on paragraphs first
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            if not paragraphs:
                paragraphs = [text]

            current_chunk = ""
            for para in paragraphs:
                if len(current_chunk) + len(para) + 2 <= chunk_size:
                    if current_chunk:
                        current_chunk += "\n\n" + para
                    else:
                        current_chunk = para
                else:
                    if current_chunk:
                        chunks.append({
                            "chunk_index": global_chunk_idx,
                            "page_number": page_num,
                            "content": current_chunk,
                            "token_count": max(1, len(current_chunk) // 4)
                        })
                        global_chunk_idx += 1

                    # Handle case where a single paragraph is longer than chunk_size
                    if len(para) > chunk_size:
                        start = 0
                        while start < len(para):
                            end = start + chunk_size
                            part = para[start:end]
                            chunks.append({
                                "chunk_index": global_chunk_idx,
                                "page_number": page_num,
                                "content": part,
                                "token_count": max(1, len(part) // 4)
                            })
                            global_chunk_idx += 1
                            start += (chunk_size - overlap)
                        current_chunk = ""
                    else:
                        current_chunk = para

            if current_chunk:
                chunks.append({
                    "chunk_index": global_chunk_idx,
                    "page_number": page_num,
                    "content": current_chunk,
                    "token_count": max(1, len(current_chunk) // 4)
                })
                global_chunk_idx += 1

        return chunks

    @classmethod
    def process_document(cls, document_id: int) -> Dict[str, Any]:
        """
        Executes full ingestion pipeline for an existing document record.
        Updates status to 'processing', chunks the document, stores in DB,
        and marks as 'completed' (or 'failed' on error).
        """
        with get_db() as conn:
            doc = conn.execute("SELECT * FROM documents WHERE id = ?", (document_id,)).fetchone()
            if not doc:
                raise PDFProcessingError(f"Document ID {document_id} not found in database.")

            file_path = Path(doc["file_path"])
            orig_filename = doc["filename"]

            # Set status to processing
            conn.execute("UPDATE documents SET status = 'processing', error_message = NULL WHERE id = ?", (document_id,))

        try:
            # 1. Validate
            cls.validate_file(file_path, orig_filename)

            # 2. Extract
            total_pages, pages_content, is_scanned = cls.extract_text_by_page(file_path)

            if is_scanned:
                raise PDFProcessingError(
                    "This document appears to contain scanned images without embedded text. "
                    "OCR is required to process non-text scanned PDFs."
                )

            # 3. Chunk
            chunks = cls.chunk_text(pages_content)
            if not chunks:
                raise PDFProcessingError("No readable text content could be extracted from this PDF.")

            # 4. Save chunks in DB
            with get_db() as conn:
                # Remove any existing chunks if re-processing
                conn.execute("DELETE FROM document_chunks WHERE document_id = ?", (document_id,))
                for ch in chunks:
                    conn.execute("""
                        INSERT INTO document_chunks (document_id, chunk_index, page_number, content, token_count)
                        VALUES (?, ?, ?, ?, ?)
                    """, (document_id, ch["chunk_index"], ch["page_number"], ch["content"], ch["token_count"]))

                # Update document completed
                conn.execute("""
                    UPDATE documents
                    SET status = 'completed',
                        page_count = ?,
                        chunk_count = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (total_pages, len(chunks), document_id))

            return {
                "document_id": document_id,
                "status": "completed",
                "page_count": total_pages,
                "chunk_count": len(chunks)
            }

        except Exception as e:
            err_msg = str(e)
            with get_db() as conn:
                conn.execute(
                    "UPDATE documents SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (err_msg, document_id)
                )
            raise PDFProcessingError(err_msg)

    @classmethod
    def delete_document(cls, document_id: int) -> bool:
        """Deletes a document from the database and removes physical file."""
        with get_db() as conn:
            doc = conn.execute("SELECT file_path FROM documents WHERE id = ?", (document_id,)).fetchone()
            if not doc:
                return False

            file_path = Path(doc["file_path"])
            # Delete record (foreign keys automatically delete chunks, quizzes, etc.)
            conn.execute("DELETE FROM documents WHERE id = ?", (document_id,))

            # Clean up disk file if exists
            try:
                if file_path.exists() and "samples" not in str(file_path):
                    file_path.unlink()
            except Exception:
                pass

            return True
