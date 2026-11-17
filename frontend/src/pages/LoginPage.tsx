import React, { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(username, password);
      login(res.token, {
        id: res.id,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'tester' | 'admin') => {
    setLoading(true);
    setError(null);
    const u = userType === 'tester' ? 'tester' : 'admin';
    const p = userType === 'tester' ? 'Tester@123' : 'Admin@123';
    try {
      const res = await api.login(u, p);
      login(res.token, {
        id: res.id,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      });
    } catch (err: any) {
      setError(err.message || `Demo login for ${u} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/25 mb-3">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">TestFusion</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Integrated Software Testing Platform Using White Box & Black Box
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Platform</span>}
          </button>
        </form>

        {/* Quick Demo Logins for Instant Evaluation */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
            Instant Demo Logins
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('tester')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Login as Tester</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-amber-300 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Don't have an account yet? </span>
          <button
            onClick={onNavigateToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center space-x-1"
          >
            <span>Create one</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
