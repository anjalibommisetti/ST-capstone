import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { User } from '../api/types';
import { 
  Shield, 
  Users, 
  Activity, 
  Cpu, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ShieldAlert,
  RefreshCw,
  X
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [userList, healthData] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminHealth().catch(() => null),
      ]);
      setUsers(userList);
      setHealth(healthData);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to load admin metrics' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleToggle = async (targetUser: User) => {
    const newRole = targetUser.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    try {
      await api.updateAdminUserRole(targetUser.id, newRole);
      setNotification({ type: 'success', message: `Updated role for ${targetUser.username} to ${newRole}` });
      await loadAdminData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update user role' });
    }
  };

  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="p-12 text-center bg-rose-950/20 border border-rose-800/40 rounded-2xl max-w-md mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Access Denied</h3>
        <p className="text-xs text-rose-300 mt-1">
          This administration dashboard requires administrator privileges (ROLE_ADMIN).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Administration Console
            </span>
            <span className="text-xs text-slate-400">• High Privilege Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Platform Administration & Health</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage users, monitor JVM environment resources, and inspect platform security logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all self-start sm:self-auto"
          title="Refresh Admin Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {notification && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
          notification.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/60 border-rose-800 text-rose-300'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Status</span>
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">
            {health?.status || 'ONLINE'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Service API Operational</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Users</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {users.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Registered platform accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">JVM Memory</span>
            <Cpu className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-sky-400">
            {health?.usedMemoryMb ? `${health.usedMemoryMb} MB` : '64 MB'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Max: {health?.maxMemoryMb ? `${health.maxMemoryMb} MB` : '1024 MB'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Sandbox Limits</span>
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-amber-400">
            6s / 128MB
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Strict process boundary</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Platform Users & Roles</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{users.length} Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">User ID</th>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-400">#{u.id}</td>
                    <td className="px-5 py-3.5 font-bold text-white font-mono">{u.username}</td>
                    <td className="px-5 py-3.5">{u.fullName}</td>
                    <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ROLE_ADMIN'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u.id !== user.id ? (
                        <button
                          onClick={() => handleRoleToggle(u)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          {u.role === 'ROLE_ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Current User</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
