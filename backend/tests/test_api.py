import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "active_provider" in data

def test_stats_endpoint():
    resp = client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_documents" in data
    assert "total_pages" in data

def test_load_sample_and_chat_flow():
    # 1. Load sample handbook
    resp = client.post("/api/documents/load-sample")
    assert resp.status_code == 200
    load_data = resp.json()
    doc_id = load_data["document_id"]
    assert doc_id > 0

    # 2. Verify document is listed
    doc_resp = client.get(f"/api/documents/{doc_id}")
    assert doc_resp.status_code == 200
    assert doc_resp.json()["status"] == "completed"
    assert doc_resp.json()["page_count"] == 5

    # 3. Ask grounded question
    chat_resp = client.post("/api/rag/chat", json={
        "message": "What is the minimum attendance requirement for exams?",
        "document_id": doc_id
    })
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "75%" in chat_data["content"] or len(chat_data["citations"]) > 0
    assert len(chat_data["citations"]) > 0
    assert chat_data["citations"][0]["page_number"] == 2

    # 4. Search document
    search_resp = client.post("/api/rag/search", json={
        "query": "tuition payment deadline",
        "document_id": doc_id,
        "top_k": 3
    })
    assert search_resp.status_code == 200
    results = search_resp.json()
    assert len(results) > 0
    assert any("August 15" in r["content"] or "Tuition" in r["content"] for r in results)

    # 5. Generate and submit quiz
    quiz_resp = client.post("/api/quiz/generate", json={
        "document_id": doc_id,
        "topic": "Academic Regulations",
        "difficulty": "medium",
        "question_count": 3
    })
    assert quiz_resp.status_code == 200
    quiz_data = quiz_resp.json()
    assert len(quiz_data["questions"]) == 3
    quiz_id = quiz_data["id"]

    # Submit answers with question 1 correct
    q1 = quiz_data["questions"][0]
    sub_resp = client.post(f"/api/quiz/{quiz_id}/submit", json={
        "answers": {q1["id"]: q1["correct_index"]}
    })
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()
    assert sub_data["total_questions"] == 3
    assert sub_data["score"] >= 1
    assert "feedback" in sub_data

    # 6. Ask unsupported question and verify limitation message
    unsupported_resp = client.post("/api/rag/chat", json={
        "message": "What is the secret recipe for Martian rocket fuel?",
        "document_id": doc_id
    })
    assert unsupported_resp.status_code == 200
    assert "do not contain sufficient information" in unsupported_resp.json()["content"]
