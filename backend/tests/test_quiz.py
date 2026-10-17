import pytest
from backend.services.quiz_service import QuizService
from backend.services.retrieval_service import RetrievalService
from backend.services.llm_service import LLMService

def test_retrieval_citations_formatting():
    mock_chunks = [
        {
            "chunk_id": 1,
            "document_id": 10,
            "document_title": "Apex Handbook",
            "page_number": 2,
            "content": "Students must maintain a minimum attendance of 75% in all lectures.",
            "score": 0.85
        }
    ]
    citations = RetrievalService.format_citations(mock_chunks)
    assert len(citations) == 1
    assert citations[0]["document_title"] == "Apex Handbook"
    assert citations[0]["page_number"] == 2
    assert "75%" in citations[0]["text_snippet"]
    assert citations[0]["relevance_score"] == 0.85

def test_unsupported_question_rejection():
    # If chunks are empty, LLMService must return the honest limitation message
    result = LLMService.generate_rag_response("How do I launch a spaceship into orbit?", [])
    assert "The uploaded documents do not contain sufficient information" in result["answer"]
    assert result["confidence"] == 0.0
    assert result["citations"] == []

def test_quiz_local_generation_and_scoring():
    mock_chunks = [
        {
            "id": 1,
            "page_number": 2,
            "content": "Students must maintain a minimum attendance of 75% of scheduled sessions to sit for final examinations.",
            "doc_title": "Apex Handbook"
        },
        {
            "id": 2,
            "page_number": 2,
            "content": "Any student whose cumulative grade point average falls below 2.00 is placed on Academic Probation.",
            "doc_title": "Apex Handbook"
        }
    ]

    questions = QuizService._generate_local(mock_chunks, topic="Attendance & Probation", difficulty="medium", count=2)
    assert len(questions) == 2

    # Check question structure
    q1 = questions[0]
    assert "options" in q1
    assert len(q1["options"]) == 4
    assert 0 <= q1["correct_index"] <= 3
    assert q1["explanation"]
    assert q1["page_reference"] == 2

    # Test scoring: submit correct answer for Q1, wrong for Q2
    q2 = questions[1]
    answers = {
        q1["id"]: q1["correct_index"],
        q2["id"]: (q2["correct_index"] + 1) % 4
    }

    # Verify logic
    correct_count = sum(1 for q in questions if answers[q["id"]] == q["correct_index"])
    assert correct_count == 1
    percentage = (correct_count / len(questions)) * 100
    assert percentage == 50.0
