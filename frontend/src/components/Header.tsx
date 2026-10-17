import React from 'react';
import { Sparkles, ShieldCheck, Cpu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  activeProvider: string;
  isConfigured: boolean;
  onOpenDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  activeProvider,
  isConfigured,
  onOpenDemo,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-8 flex items-center justify-between z-10 shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Provider Tag */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">RAG Engine:</span>
          <span className="text-slate-200 font-medium">
            {activeProvider === 'local' ? 'Local Grounded RAG' : activeProvider}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
        </div>

        {/* Grounding guarantee badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict Citation Grounding</span>
        </div>

        {/* Demo trigger button */}
        <button
          onClick={onOpenDemo}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Expo Guide</span>
        </button>
      </div>
    </header>
  );
};
