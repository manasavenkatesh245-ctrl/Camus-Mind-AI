import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileUp,
  BookOpen,
  Loader2,
  Sparkles
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onInspectChunks: (doc: DocumentItem) => void;
  onLoadSample: () => Promise<void>;
  loadingSample: boolean;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onUpload,
  onDelete,
  onInspectChunks,
  onLoadSample,
  loadingSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    // Frontend validation
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Invalid file type. Only PDF (.pdf) documents are supported.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum limit is 25 MB.`);
      return;
    }

    try {
      setUploading(true);
      await onUpload(file);
      setUploadSuccess(`Successfully uploaded and indexed "${file.name}"!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process PDF.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document and all its indexed chunks?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Document Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload institutional PDFs, track chunking progress, and manage searchable knowledge collections.
          </p>
        </div>

        <button
          onClick={onLoadSample}
          disabled={loadingSample}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all shadow-sm"
        >
          {loadingSample ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          ) : (
            <BookOpen className="w-4 h-4 text-amber-400" />
          )}
          <span>{loadingSample ? 'Indexing Demo...' : 'Load Apex Demo Handbook'}</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-3 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          {uploading ? (
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
          ) : (
            <Upload className="w-7 h-7" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-200">
            {uploading ? 'Parsing and Vectorizing PDF...' : 'Drag & drop your college PDF handbook or syllabus'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports PDF files up to 25 MB with automatic page extraction and sliding chunk overlapping.
          </p>
        </div>

        <button
          type="button"
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors pointer-events-none"
        >
          Browse Files
        </button>
      </div>

      {/* Feedback Messages */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Document Repository Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            Uploaded Documents
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {documents.length} files
            </span>
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileUp className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No documents uploaded yet</p>
            <p className="text-[11px] text-slate-500">
              Upload a course syllabus or click "Load Apex Demo Handbook" above to test the ingestion pipeline.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Document Title & Filename</th>
                  <th className="px-6 py-3.5 font-semibold">Pages</th>
                  <th className="px-6 py-3.5 font-semibold">Indexed Chunks</th>
                  <th className="px-6 py-3.5 font-semibold">File Size</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-200 truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
                            <span className="truncate">{doc.title}</span>
                            {doc.is_demo && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/20 font-medium">
                                Demo
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{doc.filename}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {doc.page_count > 0 ? `${doc.page_count} pages` : '—'}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => onInspectChunks(doc)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-[11px] font-medium transition-colors"
                      >
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span>{doc.chunk_count} chunks</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {(doc.file_size / 1024).toFixed(0)} KB
                    </td>

                    <td className="px-6 py-4">
                      {doc.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Indexed & Ready</span>
                        </span>
                      ) : doc.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onInspectChunks(doc)}
                          title="Inspect Chunks"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          title="Delete Document"
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
