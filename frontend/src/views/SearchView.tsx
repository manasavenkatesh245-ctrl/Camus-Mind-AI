import React, { useState } from 'react';
import { Search, FileText, Layers, Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { SearchResult, DocumentItem } from '../types';
import { searchDocuments } from '../api';

interface SearchViewProps {
  documents: DocumentItem[];
  onOpenCitation: (docTitle: string, pageNum: number, snippet: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  documents,
  onOpenCitation,
}) => {
  const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const res = await searchDocuments(query, selectedDocId, 8);
      setResults(res);
    } catch (err: any) {
      alert(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-400" />
          <span>Semantic Document Search</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform vector and keyword search across your college document repository with exact page tracking.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search policies, attendance rules, grade thresholds, deadlines..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : null)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Uploaded Documents</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Results Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Scanning indexed vector chunks...</span>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs rounded-2xl bg-slate-900/40 border border-slate-800">
            No matching passages found for "{query}". Try adjusting keywords or broadening your search.
          </div>
        ) : (
          results.map((r, i) => (
            <div
              key={r.chunk_id || i}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{r.document_title}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/30">
                    Page {r.page_number}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">
                  Match Score: {(r.score * 100).toFixed(0)}%
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                {r.content}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={() => onOpenCitation(r.document_title, r.page_number, r.content)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Inspect Evidence Citation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
