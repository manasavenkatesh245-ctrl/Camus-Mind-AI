import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  Trash2,
  Plus,
  Loader2,
  FileText,
  AlertCircle,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Bot,
  User,
  Filter
} from 'lucide-react';
import { ChatMessage, ChatSession, DocumentItem, Citation } from '../types';
import {
  sendChatMessage,
  fetchChatSessions,
  fetchSessionMessages,
  deleteChatSession
} from '../api';

interface ChatViewProps {
  documents: DocumentItem[];
  onSelectCitation: (citation: Citation) => void;
  onOpenDemo: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  documents,
  onSelectCitation,
  onOpenDemo,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'What is the minimum attendance requirement to sit for exams?',
    'What are the penalties for plagiarism under the Code of Conduct?',
    'What is the CGPA required for Dean’s List honors?',
    'When is the tuition payment deadline for the Fall semester?',
    'Where is the Student Health and Counseling Clinic located?',
    'What is the procedure for launching a space rocket from campus?', // Insufficient evidence test
  ];

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await fetchChatSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        selectSession(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    try {
      const msgs = await fetchSessionMessages(sessionId);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleClearSession = async (sessionId: string) => {
    if (window.confirm('Clear this chat conversation?')) {
      await deleteChatSession(sessionId);
      await loadSessions();
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || inputQuery;
    if (!query.trim() || loading) return;

    setInputQuery('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      session_id: currentSessionId || '',
      role: 'user',
      content: query,
      citations: [],
      confidence: 1.0,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await sendChatMessage(query, currentSessionId || undefined, selectedDocId);
      setCurrentSessionId(res.session_id);
      setMessages(prev => [...prev, res]);
      loadSessions();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        session_id: currentSessionId || '',
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to retrieve answer.'}`,
        citations: [],
        confidence: 0,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Session History Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/60 hidden md:flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-400">
            Recent Conversations
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No conversations yet
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => selectSession(sess.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  currentSessionId === sess.id
                    ? 'bg-slate-800 text-slate-100 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Bot className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span className="truncate">{sess.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearSession(sess.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  title="Clear chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
        {/* Chat Control Toolbar */}
        <div className="h-12 border-b border-slate-800 bg-slate-900/40 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Scope:</span>
            <select
              value={selectedDocId || ''}
              onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : null)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Uploaded Documents ({documents.length})</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Conversation</span>
            </button>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/10">
                <Sparkles className="w-7 h-7 text-indigo-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-100">
                  Ask Anything About Your College Documents
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  CampusMind AI grounds every answer in your uploaded PDFs, citing exact page numbers. If the documents lack evidence, it will honestly state so.
                </p>
              </div>

              {/* Sample Prompt Chips */}
              <div className="space-y-2.5 pt-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Click a Sample Technology Expo Prompt
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmit(undefined, q)}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 text-slate-300 text-xs text-left transition-all flex items-start gap-2.5 group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
                      <span className="group-hover:text-slate-100">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-3 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-xl'
                    }`}
                  >
                    {/* Message Body */}
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>

                    {/* Citations Footer (Assistant messages only) */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Supporting Source Citations ({msg.citations.length})</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cite, i) => (
                            <button
                              key={i}
                              onClick={() => onSelectCitation(cite)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all hover:scale-105"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="truncate max-w-[140px]">{cite.document_title}</span>
                              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 text-[10px]">
                                p.{cite.page_number}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assistant Action Buttons */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          {msg.provider_used && (
                            <span className="text-[10px] text-slate-400">
                              via {msg.provider_used}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loader indicator while assistant is generating */}
              {loading && (
                <div className="flex gap-3.5 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Searching vector chunks and verifying page citations...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="max-w-3xl mx-auto relative flex items-center"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question about your uploaded college documents..."
              disabled={loading}
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="absolute right-2.5 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-slate-400">
            CampusMind AI answers are strictly bounded by your uploaded documents. Citations are verified against page text.
          </div>
        </div>
      </div>
    </div>
  );
};
