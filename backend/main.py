import os
import shutil
import uuid
import json
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import (
    UPLOADS_DIR, SAMPLES_DIR, BASE_DIR, MAX_UPLOAD_SIZE_MB,
    DEFAULT_TOP_K, SIMILARITY_THRESHOLD
)
from backend.database import init_db, get_db, get_setting, set_setting
from backend.models import (
    DocumentResponse, DocumentChunkResponse, ChatMessageRequest,
    ChatMessageResponse, ChatSessionResponse, SearchRequest, SearchResult,
    QuizCreateRequest, QuizResponse, QuizSubmitRequest, QuizSubmitResponse,
    StatsResponse, SettingsUpdate, Citation
)
from backend.services.pdf_service import PDFService, PDFProcessingError
from backend.services.retrieval_service import RetrievalService
from backend.services.llm_service import LLMService
from backend.services.quiz_service import QuizService
from backend.sample_generator import generate_sample_handbook_pdf

# Initialize Database
init_db()

app = FastAPI(
    title="CampusMind AI Backend",
    description="Intelligent College Knowledge Assistant API for tech expo demo",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- SYSTEM & HEALTH -----------------

@app.get("/api/health")
def health_check():
    provider, gemini_key, openai_key = LLMService.get_api_credentials()
    return {
        "status": "healthy",
        "service": "CampusMind AI",
        "version": "1.0.0",
        "active_provider": provider,
        "is_configured": bool(gemini_key or openai_key)
    }

@app.get("/api/stats", response_model=StatsResponse)
def get_stats():
    with get_db() as conn:
        doc_count = conn.execute("SELECT COUNT(*) FROM documents WHERE status = 'completed'").fetchone()[0]
        page_count = conn.execute("SELECT COALESCE(SUM(page_count), 0) FROM documents WHERE status = 'completed'").fetchone()[0]
        chunk_count = conn.execute("SELECT COUNT(*) FROM document_chunks").fetchone()[0]
        chat_count = conn.execute("SELECT COUNT(*) FROM chat_messages").fetchone()[0]
        quiz_count = conn.execute("SELECT COUNT(*) FROM quiz_attempts").fetchone()[0]

    provider, gemini_key, openai_key = LLMService.get_api_credentials()
    return StatsResponse(
        total_documents=doc_count,
        total_pages=page_count,
        total_chunks=chunk_count,
        total_chat_messages=chat_count,
        total_quizzes_taken=quiz_count,
        active_provider=provider,
        is_configured=bool(gemini_key or openai_key)
    )

# ----------------- DOCUMENT MANAGEMENT -----------------

@app.post("/api/documents/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF (.pdf) documents are supported."
        )

    # Save to disk
    file_id = uuid.uuid4().hex[:8]
    safe_name = f"{file_id}_{Path(filename).name}"
    target_path = UPLOADS_DIR / safe_name

    try:
        content = await file.read()
        file_size = len(content)

        if file_size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE_MB}MB."
            )

        with open(target_path, "wb") as f:
            f.write(content)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    # Extract clean title from filename
    title = Path(filename).stem.replace("_", " ").replace("-", " ").title()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO documents (filename, title, file_path, file_size, status)
            VALUES (?, ?, ?, ?, 'pending')
        """, (filename, title, str(target_path), file_size))
        doc_id = cursor.lastrowid

    # Process immediately
    try:
        PDFService.process_document(doc_id)
    except PDFProcessingError as e:
        # Status has already been updated to failed in DB
        pass

    with get_db() as conn:
        doc = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()

    return DocumentResponse(
        id=doc["id"],
        filename=doc["filename"],
        title=doc["title"],
        file_size=doc["file_size"],
        page_count=doc["page_count"],
        status=doc["status"],
        error_message=doc["error_message"],
        chunk_count=doc["chunk_count"],
        is_demo=bool(doc["is_demo"]),
        created_at=str(doc["created_at"])
    )

@app.get("/api/documents", response_model=List[DocumentResponse])
def list_documents():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM documents ORDER BY created_at DESC").fetchall()

    return [
        DocumentResponse(
            id=r["id"],
            filename=r["filename"],
            title=r["title"],
            file_size=r["file_size"],
            page_count=r["page_count"],
            status=r["status"],
            error_message=r["error_message"],
            chunk_count=r["chunk_count"],
            is_demo=bool(r["is_demo"]),
            created_at=str(r["created_at"])
        )
        for r in rows
    ]

@app.get("/api/documents/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int):
    with get_db() as conn:
        doc = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {doc_id} not found.")

    return DocumentResponse(
        id=doc["id"],
        filename=doc["filename"],
        title=doc["title"],
        file_size=doc["file_size"],
        page_count=doc["page_count"],
        status=doc["status"],
        error_message=doc["error_message"],
        chunk_count=doc["chunk_count"],
        is_demo=bool(doc["is_demo"]),
        created_at=str(doc["created_at"])
    )

@app.get("/api/documents/{doc_id}/chunks", response_model=List[DocumentChunkResponse])
def get_document_chunks(doc_id: int):
    with get_db() as conn:
        chunks = conn.execute(
            "SELECT * FROM document_chunks WHERE document_id = ? ORDER BY chunk_index ASC",
            (doc_id,)
        ).fetchall()

    return [
        DocumentChunkResponse(
            id=c["id"],
            document_id=c["document_id"],
            chunk_index=c["chunk_index"],
            page_number=c["page_number"],
            content=c["content"],
            token_count=c["token_count"]
        )
        for c in chunks
    ]

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int):
    success = PDFService.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"message": f"Document {doc_id} and associated vector chunks deleted successfully."}

@app.post("/api/documents/load-sample")
def load_sample_document():
    """Generates and loads the official Apex College Handbook demo dataset."""
    sample_path = SAMPLES_DIR / "apex_student_handbook_2024.pdf"
    generate_sample_handbook_pdf(sample_path)

    # Check if already in DB
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM documents WHERE is_demo = 1").fetchone()
        if existing:
            # Re-process to ensure fresh state
            PDFService.process_document(existing["id"])
            return {"message": "Sample handbook refreshed successfully.", "document_id": existing["id"]}

    file_size = sample_path.stat().st_size
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO documents (filename, title, file_path, file_size, status, is_demo)
            VALUES ('apex_student_handbook_2024.pdf', 'Apex Student Academic & Campus Life Handbook (2024-2025)', ?, ?, 'pending', 1)
        """, (str(sample_path), file_size))
        doc_id = cursor.lastrowid

    PDFService.process_document(doc_id)
    return {"message": "Sample handbook loaded and indexed successfully.", "document_id": doc_id}

# ----------------- RAG CHAT ASSISTANT -----------------

@app.post("/api/rag/chat", response_model=ChatMessageResponse)
def chat_with_documents(request: ChatMessageRequest):
    user_query = request.message.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    session_id = request.session_id
    if not session_id:
        session_id = f"session_{uuid.uuid4().hex[:10]}"
        # Create session
        title = user_query[:40] + ("..." if len(user_query) > 40 else "")
        with get_db() as conn:
            conn.execute("""
                INSERT INTO chat_sessions (id, title, document_id)
                VALUES (?, ?, ?)
            """, (session_id, title, request.document_id))

    # Save user message
    user_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    with get_db() as conn:
        conn.execute("""
            INSERT INTO chat_messages (id, session_id, role, content)
            VALUES (?, ?, 'user', ?)
        """, (user_msg_id, session_id, user_query))

    # Retrieve relevant chunks
    retrieved_chunks = RetrievalService.search(
        query=user_query,
        document_id=request.document_id,
        top_k=DEFAULT_TOP_K
    )

    # Generate answer
    rag_result = LLMService.generate_rag_response(
        question=user_query,
        chunks=retrieved_chunks
    )

    citations = RetrievalService.format_citations(rag_result.get("citations", []))

    # Save assistant message
    asst_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    with get_db() as conn:
        conn.execute("""
            INSERT INTO chat_messages (id, session_id, role, content, citations_json, confidence)
            VALUES (?, ?, 'assistant', ?, ?, ?)
        """, (asst_msg_id, session_id, rag_result["answer"], json.dumps(citations), rag_result["confidence"]))
        conn.execute("UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))

    return ChatMessageResponse(
        id=asst_msg_id,
        session_id=session_id,
        role="assistant",
        content=rag_result["answer"],
        citations=[Citation(**c) for c in citations],
        confidence=rag_result["confidence"],
        provider_used=rag_result["provider_used"],
        created_at=str(uuid.uuid1())
    )

@app.get("/api/rag/sessions", response_model=List[ChatSessionResponse])
def get_chat_sessions():
    with get_db() as conn:
        rows = conn.execute("""
            SELECT s.*, COUNT(m.id) as message_count
            FROM chat_sessions s
            LEFT JOIN chat_messages m ON s.id = m.session_id
            GROUP BY s.id
            ORDER BY s.updated_at DESC
        """).fetchall()

    return [
        ChatSessionResponse(
            id=r["id"],
            title=r["title"],
            document_id=r["document_id"],
            created_at=str(r["created_at"]),
            updated_at=str(r["updated_at"]),
            message_count=r["message_count"]
        )
        for r in rows
    ]

@app.get("/api/rag/sessions/{session_id}/messages")
def get_session_messages(session_id: str):
    with get_db() as conn:
        messages = conn.execute("""
            SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC
        """, (session_id,)).fetchall()

    result = []
    for m in messages:
        citations_data = json.loads(m["citations_json"]) if m["citations_json"] else []
        result.append({
            "id": m["id"],
            "session_id": m["session_id"],
            "role": m["role"],
            "content": m["content"],
            "citations": citations_data,
            "confidence": m["confidence"],
            "created_at": str(m["created_at"])
        })
    return result

@app.delete("/api/rag/sessions/{session_id}")
def delete_chat_session(session_id: str):
    with get_db() as conn:
        conn.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
    return {"message": "Chat session cleared successfully."}

# ----------------- DOCUMENT SEARCH -----------------

@app.post("/api/rag/search", response_model=List[SearchResult])
def search_documents(request: SearchRequest):
    results = RetrievalService.search(
        query=request.query,
        document_id=request.document_id,
        top_k=request.top_k
    )
    return [
        SearchResult(
            chunk_id=r["chunk_id"],
            document_id=r["document_id"],
            document_title=r["document_title"],
            page_number=r["page_number"],
            content=r["content"],
            score=r["score"]
        )
        for r in results
    ]

# ----------------- AI QUIZ GENERATOR -----------------

@app.post("/api/quiz/generate", response_model=QuizResponse)
def generate_quiz(request: QuizCreateRequest):
    try:
        quiz = QuizService.generate_quiz(
            document_id=request.document_id,
            topic=request.topic,
            difficulty=request.difficulty,
            question_count=request.question_count
        )
        return QuizResponse(**quiz)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/quiz/list")
def list_quizzes():
    with get_db() as conn:
        quizzes = conn.execute("""
            SELECT q.*, d.title as document_title,
                   (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempts_count
            FROM quizzes q
            LEFT JOIN documents d ON q.document_id = d.id
            ORDER BY q.created_at DESC
        """).fetchall()

    return [
        {
            "id": q["id"],
            "title": q["title"],
            "topic": q["topic"],
            "difficulty": q["difficulty"],
            "document_id": q["document_id"],
            "document_title": q["document_title"] or "All Documents",
            "question_count": q["question_count"],
            "attempts_count": q["attempts_count"],
            "created_at": str(q["created_at"])
        }
        for q in quizzes
    ]

@app.get("/api/quiz/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: str):
    with get_db() as conn:
        quiz = conn.execute("""
            SELECT q.*, d.title as document_title
            FROM quizzes q
            LEFT JOIN documents d ON q.document_id = d.id
            WHERE q.id = ?
        """, (quiz_id,)).fetchone()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    questions = json.loads(quiz["questions_json"])
    return QuizResponse(
        id=quiz["id"],
        title=quiz["title"],
        topic=quiz["topic"],
        difficulty=quiz["difficulty"],
        document_id=quiz["document_id"],
        document_title=quiz["document_title"] or "All Documents",
        question_count=quiz["question_count"],
        questions=questions,
        created_at=str(quiz["created_at"])
    )

@app.post("/api/quiz/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(quiz_id: str, request: QuizSubmitRequest):
    try:
        # Answers dict maps question_id to selected_option_index
        result = QuizService.evaluate_quiz(quiz_id, request.answers)
        return QuizSubmitResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/quiz/{quiz_id}/attempts")
def get_quiz_attempts(quiz_id: str):
    with get_db() as conn:
        attempts = conn.execute("""
            SELECT * FROM quiz_attempts WHERE quiz_id = ? ORDER BY completed_at DESC
        """, (quiz_id,)).fetchall()

    return [
        {
            "id": a["id"],
            "quiz_id": a["quiz_id"],
            "score": a["score"],
            "total_questions": a["total_questions"],
            "percentage": a["percentage"],
            "completed_at": str(a["completed_at"])
        }
        for a in attempts
    ]

# ----------------- SETTINGS & CONFIGURATION -----------------

@app.get("/api/settings")
def get_system_settings():
    provider, gemini_key, openai_key = LLMService.get_api_credentials()
    masked_gemini = f"{gemini_key[:4]}...{gemini_key[-4:]}" if len(gemini_key) > 8 else ("Configured" if gemini_key else "Not Configured")
    masked_openai = f"{openai_key[:4]}...{openai_key[-4:]}" if len(openai_key) > 8 else ("Configured" if openai_key else "Not Configured")

    return {
        "active_provider": provider,
        "gemini_status": masked_gemini,
        "openai_status": masked_openai,
        "similarity_threshold": float(get_setting("similarity_threshold", str(SIMILARITY_THRESHOLD))),
        "top_k": int(get_setting("top_k", str(DEFAULT_TOP_K)))
    }

@app.post("/api/settings")
def update_system_settings(settings: SettingsUpdate):
    if settings.gemini_api_key is not None:
        set_setting("gemini_api_key", settings.gemini_api_key.strip())
    if settings.openai_api_key is not None:
        set_setting("openai_api_key", settings.openai_api_key.strip())
    if settings.provider is not None:
        set_setting("provider", settings.provider.strip())
    if settings.similarity_threshold is not None:
        set_setting("similarity_threshold", str(settings.similarity_threshold))
    if settings.top_k is not None:
        set_setting("top_k", str(settings.top_k))

    return {"message": "Settings updated successfully."}

# Mount frontend build static files if present
frontend_dist = BASE_DIR / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
