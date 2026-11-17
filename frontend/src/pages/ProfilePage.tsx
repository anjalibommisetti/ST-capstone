import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await api.updateProfile({
        fullName,
        email,
        password: password || undefined,
      });
      if (user) {
        updateUser({
          ...user,
          fullName,
          email,
        });
      }
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
            Identity & Preferences
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center space-x-2">
          <UserIcon className="w-6 h-6 text-indigo-400" />
          <span>User Profile</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your credentials, testing platform role, and account information.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="text-lg font-bold text-white">{user?.fullName || user?.username}</div>
            <div className="text-xs text-slate-400 font-mono">@{user?.username}</div>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                user?.role === 'ROLE_ADMIN'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
              }`}>
                {user?.role === 'ROLE_ADMIN' ? 'PLATFORM ADMINISTRATOR' : 'QA ENGINEER'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          <div>Email: <span className="text-slate-200 font-medium">{user?.email}</span></div>
          <div>Security: <span className="text-emerald-400 font-medium">JWT Stateless Bearer</span></div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-indigo-400" />
          <span>Account Settings</span>
        </h3>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (leave blank to keep)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Permissions & Security Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Access Rights</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your account is granted {user?.role === 'ROLE_ADMIN' ? 'Platform Administrator privileges with full system health monitoring, user role modifications, and global project oversight' : 'QA Engineer privileges with project creation, test case synthesis, isolated sandbox execution, and defect tracking capabilities'}.
        </p>
      </div>
    </div>
  );
};
