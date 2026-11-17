import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  Layers, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Bell, 
  ChevronDown,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  onOpenRunModal: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRunModal, onNavigate }) => {
  const { user, selectedProject, projects, setSelectedProject, logout } = useAuth();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Project Selector */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/70 transition-all text-sm font-medium text-slate-200"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-slate-400 text-xs">Project:</span>
            <span className="font-semibold text-white max-w-[200px] truncate">
              {selectedProject ? selectedProject.name : 'No Project Selected'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {projectDropdownOpen && (
            <div 
              className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setProjectDropdownOpen(false)}
            >
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Active Projects ({projects.length})
              </div>
              <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProject(p);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      selectedProject?.id === p.id 
                        ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-slate-200 truncate">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.language}</div>
                    </div>
                    {selectedProject?.id === p.id && (
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    onNavigate('projects');
                  }}
                  className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1.5 rounded hover:bg-slate-800/50 flex items-center justify-center space-x-1"
                >
                  <span>Manage All Projects</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedProject && (
          <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            {selectedProject.language} 17
          </span>
        )}
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center space-x-3">
        {/* Quick Run Tests Button */}
        {selectedProject && (
          <button
            onClick={onOpenRunModal}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run Tests</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button 
            title="System Notifications"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white font-semibold text-xs shadow-md">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-slate-200">{user?.fullName || user?.username}</div>
              <div className="text-slate-400 capitalize">{user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'QA Tester'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="font-medium text-slate-200 text-sm">{user?.fullName}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>

                {user?.role === 'ROLE_ADMIN' && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-amber-300 hover:bg-amber-950/30 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Admin Dashboard</span>
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/30 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
