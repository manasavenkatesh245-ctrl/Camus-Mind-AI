import {
  DocumentItem, DocumentChunk, ChatMessage, ChatSession,
  SearchResult, Quiz, QuizSubmissionResult, SystemStats, SystemSettings
} from './types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchStats(): Promise<SystemStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument(file: File): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function loadSampleHandbook(): Promise<{ message: string; document_id: number }> {
  const res = await fetch(`${API_BASE}/documents/load-sample`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to load sample handbook' }));
    throw new Error(err.detail || 'Failed to load sample handbook');
  }
  return res.json();
}

export async function deleteDocument(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
}

export async function fetchDocumentChunks(id: number): Promise<DocumentChunk[]> {
  const res = await fetch(`${API_BASE}/documents/${id}/chunks`);
  if (!res.ok) throw new Error('Failed to fetch chunks');
  return res.json();
}

export async function sendChatMessage(message: string, sessionId?: string, documentId?: number | null): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/rag/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      document_id: documentId || null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Chat query failed' }));
    throw new Error(err.detail || 'Chat query failed');
  }
  return res.json();
}

export async function fetchChatSessions(): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/rag/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function fetchSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/rag/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch session messages');
  return res.json();
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/rag/sessions/${sessionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
}

export async function searchDocuments(query: string, documentId?: number | null, topK = 5): Promise<SearchResult[]> {
  const res = await fetch(`${API_BASE}/rag/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, document_id: documentId || null, top_k: topK }),
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function generateQuiz(topic: string, difficulty: string, questionCount: number, documentId?: number | null): Promise<Quiz> {
  const res = await fetch(`${API_BASE}/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      difficulty,
      question_count: questionCount,
      document_id: documentId || null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Quiz generation failed' }));
    throw new Error(err.detail || 'Quiz generation failed');
  }
  return res.json();
}

export async function fetchQuizList(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/quiz/list`);
  if (!res.ok) throw new Error('Failed to fetch quizzes');
  return res.json();
}

export async function fetchQuiz(id: string): Promise<Quiz> {
  const res = await fetch(`${API_BASE}/quiz/${id}`);
  if (!res.ok) throw new Error('Failed to fetch quiz');
  return res.json();
}

export async function submitQuizAnswers(quizId: string, answers: Record<number, number>): Promise<QuizSubmissionResult> {
  const res = await fetch(`${API_BASE}/quiz/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to submit quiz' }));
    throw new Error(err.detail || 'Failed to submit quiz');
  }
  return res.json();
}

export async function fetchSettings(): Promise<SystemSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings: {
  gemini_api_key?: string;
  openai_api_key?: string;
  provider?: string;
  similarity_threshold?: number;
  top_k?: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
}
