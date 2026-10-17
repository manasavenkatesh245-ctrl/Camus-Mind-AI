import pytest
from pathlib import Path
from backend.services.pdf_service import PDFService, PDFProcessingError
from backend.sample_generator import generate_sample_handbook_pdf

def test_pdf_validation_valid(tmp_path):
    pdf_file = tmp_path / "valid.pdf"
    generate_sample_handbook_pdf(pdf_file)
    # Should not raise
    PDFService.validate_file(pdf_file, "valid.pdf")

def test_pdf_validation_invalid_extension(tmp_path):
    txt_file = tmp_path / "test.txt"
    txt_file.write_text("Hello world")
    with pytest.raises(PDFProcessingError, match="Unsupported file type"):
        PDFService.validate_file(txt_file, "test.txt")

def test_pdf_validation_corrupt_signature(tmp_path):
    corrupt_pdf = tmp_path / "corrupt.pdf"
    corrupt_pdf.write_text("NOT A REAL PDF HEADER")
    with pytest.raises(PDFProcessingError, match="Invalid file signature"):
        PDFService.validate_file(corrupt_pdf, "corrupt.pdf")

def test_pdf_text_extraction_and_chunking(tmp_path):
    pdf_file = tmp_path / "handbook.pdf"
    generate_sample_handbook_pdf(pdf_file)

    total_pages, pages_content, is_scanned = PDFService.extract_text_by_page(pdf_file)
    assert total_pages == 5
    assert not is_scanned
    assert len(pages_content) == 5

    # Check page 2 has academic policies
    p2_text = pages_content[1]["text"]
    assert "Section 1" in p2_text or "Attendance" in p2_text

    chunks = PDFService.chunk_text(pages_content, chunk_size=500, overlap=100)
    assert len(chunks) > 5

    # Check all chunks have required metadata
    for ch in chunks:
        assert "chunk_index" in ch
        assert "page_number" in ch
        assert "content" in ch
        assert 1 <= ch["page_number"] <= 5
        assert len(ch["content"]) > 0
