import React from 'react';
import {
  FileText,
  MessageSquare,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { DocumentItem, SystemStats } from '../types';

interface DashboardViewProps {
  stats: SystemStats | null;
  documents: DocumentItem[];
  onNavigate: (tab: string) => void;
  onOpenDemo: () => void;
  onLoadSample: () => void;
  loadingSample: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  documents,
  onNavigate,
  onOpenDemo,
  onLoadSample,
  loadingSample,
}) => {
  const metricCards = [
    {
      label: 'Indexed Documents',
      value: stats?.total_documents ?? documents.length,
      icon: FileText,
      color: 'from-blue-600 to-indigo-600',
      description: 'PDF handbooks, syllabi & notices',
    },
    {
      label: 'Verified Pages',
      value: stats?.total_pages ?? documents.reduce((acc, d) => acc + d.page_count, 0),
      icon: Layers,
      color: 'from-emerald-600 to-teal-600',
      description: 'Extracted with page references',
    },
    {
      label: 'Vector Chunks',
      value: stats?.total_chunks ?? documents.reduce((acc, d) => acc + d.chunk_count, 0),
      icon: Search,
      color: 'from-purple-600 to-violet-600',
      description: 'Indexed for semantic retrieval',
    },
    {
      label: 'Quizzes Taken',
      value: stats?.total_quizzes_taken ?? 0,
      icon: GraduationCap,
      color: 'from-amber-600 to-orange-600',
      description: 'Grounded MCQ knowledge checks',
    },
  ];

  const recentDocs = documents.slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Campus Knowledge Grounding System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            CampusMind <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Eliminate handbook hunting. Ask questions with verifiable page citations, generate mastery quizzes,
            and explore academic policies backed by local or cloud intelligence.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {documents.length === 0 && (
              <button
                onClick={onLoadSample}
                disabled={loadingSample}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 text-slate-200 text-xs font-semibold transition-all"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{loadingSample ? 'Loading Demo Handbook...' : 'Load Demo College Handbook'}</span>
              </button>
            )}

            <button
              onClick={onOpenDemo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Technology Expo Demo Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-1">{card.value}</div>
              <p className="text-[11px] text-slate-400">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
            Quick Actions
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('documents')}
              className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Upload PDF Document</h4>
                  <p className="text-[11px] text-slate-400">Add course syllabus, handbook or notice</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('quiz')}
              className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Generate Practice Quiz</h4>
                  <p className="text-[11px] text-slate-400">Test knowledge with grounded MCQs</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('search')}
              className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Semantic Document Search</h4>
                  <p className="text-[11px] text-slate-400">Locate passages by meaning & keywords</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Recent Documents Table / Empty State */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Document Repository ({documents.length})
            </h3>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-200">No documents uploaded yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Upload your college PDF documents or instantly load the official demo handbook to explore CampusMind AI.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onLoadSample}
                  disabled={loadingSample}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  {loadingSample ? 'Loading Demo Handbook...' : 'Load Apex Demo Handbook'}
                </button>
                <button
                  onClick={() => onNavigate('documents')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Upload Your Own PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-slate-200 truncate">{doc.title}</h5>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>{doc.page_count} pages</span>
                        <span>•</span>
                        <span>{doc.chunk_count} chunks</span>
                        <span>•</span>
                        <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Indexed</span>
                      </span>
                    ) : doc.status === 'processing' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Processing</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-3 h-3" />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
