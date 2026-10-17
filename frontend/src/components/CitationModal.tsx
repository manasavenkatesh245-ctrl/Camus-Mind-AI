import React from 'react';
import { X, BookOpen, FileText, CheckCircle2, Copy } from 'lucide-react';
import { Citation } from '../types';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Source: ${citation.document_title} (Page ${citation.page_number})\nExcerpt: "${citation.text_snippet}"`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Verified Evidence Citation</h3>
              <p className="text-xs text-slate-400">Retrieved from authoritative uploaded document</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Metadata pill row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Document Source
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 truncate">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">{citation.document_title}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Verified Location
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                  Page {citation.page_number}
                </span>
                {citation.relevance_score > 0 && (
                  <span className="text-[11px] text-slate-400 font-normal">
                    Relevance: {Math.round(citation.relevance_score * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Supporting Source Passage
            </label>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
              "{citation.text_snippet}"
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>This excerpt was retrieved directly from the vector index and verified against file content.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Citation'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
