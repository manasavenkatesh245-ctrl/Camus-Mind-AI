export interface DocumentItem {
  id: number;
  filename: string;
  title: string;
  file_size: number;
  page_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string | null;
  chunk_count: number;
  is_demo: boolean;
  created_at: string;
}

export interface DocumentChunk {
  id: number;
  document_id: number;
  chunk_index: number;
  page_number: number;
  content: string;
  token_count: number;
}

export interface Citation {
  document_id: number;
  document_title: string;
  page_number: number;
  chunk_id?: number | null;
  text_snippet: string;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  confidence: number;
  provider_used?: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  document_id?: number | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SearchResult {
  chunk_id: number;
  document_id: number;
  document_title: string;
  page_number: number;
  content: string;
  score: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  page_reference?: number | null;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  document_id?: number | null;
  document_title?: string | null;
  question_count: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizQuestionResult {
  question_id: number;
  question: string;
  options: string[];
  selected_index?: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
  page_reference?: number | null;
}

export interface QuizSubmissionResult {
  attempt_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  feedback: string;
  results: QuizQuestionResult[];
}

export interface SystemStats {
  total_documents: number;
  total_pages: number;
  total_chunks: number;
  total_chat_messages: number;
  total_quizzes_taken: number;
  active_provider: string;
  is_configured: boolean;
}

export interface SystemSettings {
  active_provider: string;
  gemini_status: string;
  openai_status: string;
  similarity_threshold: number;
  top_k: number;
}
