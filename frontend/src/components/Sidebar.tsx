import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderGit2,
  FileCode,
  Binary,
  GitFork,
  Boxes,
  ListTodo,
  PlayCircle,
  Bug,
  FileText,
  History,
  User,
  Shield,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, selectedProject } = useAuth();

  const navigationSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: FolderGit2 },
        { id: 'project-details', label: 'Project Overview', icon: Info, requiresProject: true },
        { id: 'code-editor', label: 'Code Editor', icon: FileCode, requiresProject: true },
      ],
    },
    {
      title: 'WHITE BOX TESTING',
      items: [
        { id: 'white-box', label: 'Source Analysis', icon: Binary, requiresProject: true },
        { id: 'cfg', label: 'Control Flow Graph', icon: GitFork, requiresProject: true },
      ],
    },
    {
      title: 'BLACK BOX TESTING',
      items: [
        { id: 'black-box', label: 'Technique Generator', icon: Boxes, requiresProject: true },
        { id: 'test-cases', label: 'Test Case Manager', icon: ListTodo, requiresProject: true },
      ],
    },
    {
      title: 'INTEGRATED RUNS & QA',
      items: [
        { id: 'execution-results', label: 'Execution Results', icon: PlayCircle, requiresProject: true },
        { id: 'defects', label: 'Defect Tracking', icon: Bug, requiresProject: true },
        { id: 'reports', label: 'Test Reports', icon: FileText, requiresProject: true },
        { id: 'history', label: 'Test History & Compare', icon: History, requiresProject: true },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/95 flex flex-col h-screen sticky top-0 select-none z-20">
      {/* Platform Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight text-white flex items-center space-x-1">
            <span>Test</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">Fusion</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            Integrated QA Suite
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((sec) => (
          <div key={sec.title}>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {sec.title}
            </div>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isDisabled = item.requiresProject && !selectedProject;

                return (
                  <button
                    key={item.id}
                    disabled={isDisabled}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : isDisabled
                        ? 'text-slate-500 cursor-not-allowed opacity-50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* System Settings & Admin Section */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            SYSTEM
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onNavigate('profile')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-slate-400" />
                <span>User Profile</span>
              </div>
            </button>

            {user?.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                  ADMIN
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info Box */}
      {selectedProject && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60 text-xs">
            <div className="text-slate-400 text-[11px]">Active Workspace</div>
            <div className="font-semibold text-slate-200 truncate mt-0.5">{selectedProject.name}</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{selectedProject.language} Target</span>
              <span className="text-emerald-400 font-mono">Isolated</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
