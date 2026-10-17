import React, { useEffect, useState } from 'react';
import { X, Layers, FileText, Search, Loader2 } from 'lucide-react';
import { DocumentChunk, DocumentItem } from '../types';
import { fetchDocumentChunks } from '../api';

interface ChunksModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const ChunksModal: React.FC<ChunksModalProps> = ({ document, onClose }) => {
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!document) return;
    setLoading(true);
    fetchDocumentChunks(document.id)
      .then(setChunks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [document]);

  if (!document) return null;

  const filteredChunks = chunks.filter(c =>
    c.content.toLowerCase().includes(filter.toLowerCase()) ||
    c.page_number.toString().includes(filter)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Indexed Chunks Explorer
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {chunks.length} chunks
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">{document.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search filter */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter chunks by keyword or page number..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Chunks List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs">Loading extracted chunks...</p>
            </div>
          ) : filteredChunks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching chunks found.
            </div>
          ) : (
            filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Chunk #{chunk.chunk_index + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Page {chunk.page_number}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ~{chunk.token_count} tokens ({chunk.content.length} chars)
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                  {chunk.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
