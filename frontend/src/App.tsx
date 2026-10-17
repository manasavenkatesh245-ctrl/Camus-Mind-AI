import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CitationModal } from './components/CitationModal';
import { ChunksModal } from './components/ChunksModal';

import { DashboardView } from './views/DashboardView';
import { DocumentsView } from './views/DocumentsView';
import { ChatView } from './views/ChatView';
import { QuizView } from './views/QuizView';
import { SearchView } from './views/SearchView';
import { SettingsView } from './views/SettingsView';

import { DocumentItem, SystemStats, Citation } from './types';
import {
  fetchDocuments,
  fetchStats,
  uploadDocument,
  deleteDocument,
  loadSampleHandbook,
  fetchHealth
} from './api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activeProvider, setActiveProvider] = useState<string>('local');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<DocumentItem | null>(null);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 12000); // Polling for processing updates
    return () => clearInterval(interval);
  }, []);

  const refreshAll = async () => {
    try {
      const [docs, st, health] = await Promise.all([
        fetchDocuments().catch(() => []),
        fetchStats().catch(() => null),
        fetchHealth().catch(() => null),
      ]);
      setDocuments(docs);
      if (st) setStats(st);
      if (health) {
        setActiveProvider(health.active_provider);
        setIsConfigured(health.is_configured);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (file: File) => {
    await uploadDocument(file);
    await refreshAll();
  };

  const handleDelete = async (id: number) => {
    await deleteDocument(id);
    await refreshAll();
  };

  const handleLoadSample = async () => {
    try {
      setLoadingSample(true);
      await loadSampleHandbook();
      await refreshAll();
      setCurrentTab('documents');
    } catch (err: any) {
      alert(err.message || 'Failed to load sample handbook');
    } finally {
      setLoadingSample(false);
    }
  };

  const handleOpenDemoGuide = () => {
    setCurrentTab('settings');
  };

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Institutional Overview',
      subtitle: 'Monitor indexed knowledge bases, verify page counts, and track AI queries',
    },
    documents: {
      title: 'Academic Document Management',
      subtitle: 'Upload, validate, chunk, and index college PDF documents',
    },
    chat: {
      title: 'Evidence-Grounded AI Assistant',
      subtitle: 'Conversational answers with explicit citations and strict zero-hallucination guardrails',
    },
    quiz: {
      title: 'AI Practice & Mastery Studio',
      subtitle: 'Automated MCQ generation and instant scoring from course materials',
    },
    search: {
      title: 'Semantic Document Search',
      subtitle: 'Explore indexed vector chunks and retrieve verbatim text passages',
    },
    settings: {
      title: 'System Settings & Expo Guide',
      subtitle: 'Provider credentials, retrieval thresholds, and live presenter walkthrough',
    },
  };

  const currentInfo = pageTitles[currentTab] || {
    title: 'CampusMind AI',
    subtitle: 'Intelligent College Knowledge Assistant',
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeProvider={activeProvider}
        isConfigured={isConfigured}
        onOpenDemo={handleOpenDemoGuide}
        documentCount={documents.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          title={currentInfo.title}
          subtitle={currentInfo.subtitle}
          activeProvider={activeProvider}
          isConfigured={isConfigured}
          onOpenDemo={handleOpenDemoGuide}
        />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              documents={documents}
              onNavigate={setCurrentTab}
              onOpenDemo={handleOpenDemoGuide}
              onLoadSample={handleLoadSample}
              loadingSample={loadingSample}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onUpload={handleUpload}
              onDelete={handleDelete}
              onInspectChunks={(doc) => setInspectingDoc(doc)}
              onLoadSample={handleLoadSample}
              loadingSample={loadingSample}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              documents={documents}
              onSelectCitation={(cite) => setActiveCitation(cite)}
              onOpenDemo={handleOpenDemoGuide}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizView
              documents={documents}
              onLoadSample={handleLoadSample}
              loadingSample={loadingSample}
            />
          )}

          {currentTab === 'search' && (
            <SearchView
              documents={documents}
              onOpenCitation={(title, page, text) => {
                setActiveCitation({
                  document_id: 0,
                  document_title: title,
                  page_number: page,
                  text_snippet: text,
                  relevance_score: 1.0,
                });
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              onLoadSample={handleLoadSample}
              loadingSample={loadingSample}
              onNavigate={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Citation Inspector Modal */}
      <CitationModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* Chunks Explorer Modal */}
      <ChunksModal
        document={inspectingDoc}
        onClose={() => setInspectingDoc(null)}
      />
    </div>
  );
}

export default App;
