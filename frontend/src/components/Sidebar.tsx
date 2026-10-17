import React from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  GraduationCap,
  Search,
  Settings,
  Sparkles,
  Server,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeProvider: string;
  isConfigured: boolean;
  onOpenDemo: () => void;
  documentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeProvider,
  isConfigured,
  onOpenDemo,
  documentCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText, badge: documentCount > 0 ? documentCount : undefined },
    { id: 'chat', label: 'AI Chat Assistant', icon: MessageSquare },
    { id: 'quiz', label: 'Quiz Studio', icon: GraduationCap },
    { id: 'search', label: 'Document Search', icon: Search },
    { id: 'settings', label: 'Settings & Expo', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
              CampusMind <span className="text-indigo-400">AI</span>
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Tech Expo 2024
            </span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Knowledge Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 1-Click Expo Demo Trigger */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/30">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">Tech Expo Showcase</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          1-Click demo handbook, sample queries, and guided walk-through.
        </p>
        <button
          onClick={onOpenDemo}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-md shadow-indigo-600/20"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Launch Demo Tour</span>
        </button>
      </div>

      {/* Engine Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConfigured ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isConfigured ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}></span>
            </span>
            <span className="text-slate-300 font-medium truncate max-w-[140px]">
              {activeProvider === 'local' ? 'Local Grounded Engine' : activeProvider}
            </span>
          </div>
          <Server className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          {isConfigured ? 'Cloud LLM Connected' : 'Offline / Expo Verified Mode'}
        </div>
      </div>
    </aside>
  );
};
