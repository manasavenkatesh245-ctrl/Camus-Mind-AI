from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DocumentResponse(BaseModel):
    id: int
    filename: str
    title: str
    file_size: int
    page_count: int
    status: str
    error_message: Optional[str] = None
    chunk_count: int
    is_demo: bool = False
    created_at: str

class DocumentChunkResponse(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    page_number: int
    content: str
    token_count: int

class Citation(BaseModel):
    document_id: int
    document_title: str
    page_number: int
    chunk_id: Optional[int] = None
    text_snippet: str
    relevance_score: float = 0.0

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    document_id: Optional[int] = None  # None means search all documents

class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    citations: List[Citation] = []
    confidence: float = 1.0
    provider_used: str = "local"
    created_at: str

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    document_id: Optional[int] = None
    created_at: str
    updated_at: str
    message_count: int = 0

class SearchRequest(BaseModel):
    query: str
    document_id: Optional[int] = None
    top_k: int = 5

class SearchResult(BaseModel):
    chunk_id: int
    document_id: int
    document_title: str
    page_number: int
    content: str
    score: float

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str] # 4 options
    correct_index: int # 0-3
    explanation: str
    page_reference: Optional[int] = None

class QuizCreateRequest(BaseModel):
    document_id: Optional[int] = None
    topic: str = "General Academic & Campus Policies"
    difficulty: str = "medium" # easy, medium, hard
    question_count: int = 5

class QuizResponse(BaseModel):
    id: str
    title: str
    topic: str
    difficulty: str
    document_id: Optional[int] = None
    document_title: Optional[str] = None
    question_count: int
    questions: List[QuizQuestion]
    created_at: str

class QuizSubmitRequest(BaseModel):
    answers: Dict[int, int] # question_id -> selected_option_index

class QuizQuestionResult(BaseModel):
    question_id: int
    question: str
    options: List[str]
    selected_index: Optional[int]
    correct_index: int
    is_correct: bool
    explanation: str
    page_reference: Optional[int]

class QuizSubmitResponse(BaseModel):
    attempt_id: str
    quiz_id: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    feedback: str
    results: List[QuizQuestionResult]

class StatsResponse(BaseModel):
    total_documents: int
    total_pages: int
    total_chunks: int
    total_chat_messages: int
    total_quizzes_taken: int
    active_provider: str
    is_configured: bool

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    provider: Optional[str] = None
    similarity_threshold: Optional[float] = None
    top_k: Optional[int] = None
