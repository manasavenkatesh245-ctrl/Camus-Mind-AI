import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  ShieldCheck,
  Key,
  Sliders,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Cpu,
  Layers,
  HelpCircle,
  Save,
  Loader2
} from 'lucide-react';
import { SystemSettings } from '../types';
import { fetchSettings, updateSettings } from '../api';

interface SettingsViewProps {
  onLoadSample: () => Promise<void>;
  loadingSample: boolean;
  onNavigate: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onLoadSample,
  loadingSample,
  onNavigate,
}) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [provider, setProvider] = useState('auto');
  const [threshold, setThreshold] = useState(0.12);
  const [topK, setTopK] = useState(4);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const data = await fetchSettings();
      setSettings(data);
      setProvider(data.active_provider);
      setThreshold(data.similarity_threshold);
      setTopK(data.top_k);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings({
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
        provider: provider,
        similarity_threshold: Number(threshold),
        top_k: Number(topK),
      });
      setSaveSuccess(true);
      setGeminiKey('');
      setOpenaiKey('');
      await loadSettingsData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>System Settings & Tech Expo Showcase</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure API credentials, retrieval parameters, or test the live Technology Expo presentation flow.
        </p>
      </div>

      {/* Expo Demo Script Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Live Technology Expo Demo Guide</h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Recommended Presenter Script
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Follow this 5-step demonstration when presenting CampusMind AI to expo judges or students:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400 block">Step 1: Document Ingestion</span>
            <p className="text-slate-400">
              Click "Load Apex Demo Handbook" to parse, extract pages, and index chunks into the vector store.
            </p>
            <button
              onClick={onLoadSample}
              disabled={loadingSample}
              className="mt-1 text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>{loadingSample ? 'Loading Demo...' : '1-Click Load Demo Handbook'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400 block">Step 2: Grounded Citations</span>
            <p className="text-slate-400">
              Go to AI Chat and ask: <i>"What is the minimum attendance requirement for exams?"</i> Show the answer and click the Page 2 citation badge to open the source snippet.
            </p>
            <button
              onClick={() => onNavigate('chat')}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Open AI Chat</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400 block">Step 3: Hallucination Prevention</span>
            <p className="text-slate-400">
              Ask: <i>"What is the procedure for launching a space rocket?"</i> Point out how the system admits insufficient evidence rather than hallucinating fake policies.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400 block">Step 4: AI Quiz Studio</span>
            <p className="text-slate-400">
              Generate a 3-question MCQ quiz on "Academic Policies", take it live, submit, and display the scored results with policy explanations.
            </p>
            <button
              onClick={() => onNavigate('quiz')}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Open Quiz Studio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400" />
          <span>LLM Provider & Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={settings?.gemini_status || 'Enter Gemini API key...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Current status: {settings?.gemini_status}
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder={settings?.openai_status || 'Enter OpenAI API key...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Current status: {settings?.openai_status}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Active Generation Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="auto">Auto-detect (Use configured cloud API, or fallback to Local Engine)</option>
            <option value="local">Local Grounded Knowledge Engine (Deterministic Offline Mode)</option>
            <option value="gemini">Google Gemini 1.5 Flash</option>
            <option value="openai">OpenAI GPT-4o-mini</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>RAG Vector Retrieval Tuning</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Minimum Similarity Threshold</span>
                <span className="font-mono text-indigo-400">{threshold}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Higher values reject unsupported questions more aggressively.
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Top-K Retrieved Chunks</span>
                <span className="font-mono text-indigo-400">{topK}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Number of relevant context passages passed to the synthesizer.
              </span>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
