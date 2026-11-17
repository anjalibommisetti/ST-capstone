import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DashboardStats } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { 
  FolderGit2, 
  PlayCircle, 
  ListTodo, 
  CheckCircle2, 
  XCircle, 
  Bug, 
  PieChart as PieIcon, 
  Activity, 
  RefreshCw, 
  TrendingUp,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
  onOpenRunModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenRunModal }) => {
  const { selectedProject } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading TestFusion analytics & metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-800/40 rounded-2xl max-w-xl mx-auto my-12">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Dashboard Offline</h3>
        <p className="text-sm text-rose-300 mt-1">{error || 'Unable to retrieve statistics'}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Chart data
  const passFailData = [
    { name: 'Passed Tests', value: stats.totalPassedTests, color: '#10b981' },
    { name: 'Failed Tests', value: stats.totalFailedTests, color: '#f43f5e' },
  ];

  const distributionData = Object.entries(stats.blackBoxDistribution || {}).map(([key, value]) => ({
    technique: key.replace('_', ' '),
    count: value,
  }));

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Top Banner & Quick Trigger */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-900/30 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Testing Analytics
            </span>
            <span className="text-xs text-slate-400">• Real-Time Engine Active</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Testing Dashboard & Coverage Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated metrics across White Box branches, Black Box suites, and defect tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboard}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {selectedProject && (
            <button
              onClick={onOpenRunModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all active:scale-95"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Execute Suite</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</span>
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {stats.totalProjects}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center space-x-1">
            <span>Active testing workspaces</span>
          </div>
        </div>

        {/* Total Test Runs */}
        <div 
          onClick={() => onNavigate('history')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Runs</span>
            <div className="p-2 rounded-xl bg-sky-600/10 text-sky-400 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {stats.totalTestRuns}
          </div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center space-x-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.passRate}% Pass Rate</span>
          </div>
        </div>

        {/* Total Test Cases */}
        <div 
          onClick={() => onNavigate('test-cases')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Cases</span>
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight flex items-baseline space-x-2">
            <span>{stats.totalTestCases}</span>
            <span className="text-xs font-normal text-slate-400">
              ({stats.totalPassedTests} pass, {stats.totalFailedTests} fail)
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center space-x-2">
            <span className="text-emerald-400 font-medium">{stats.totalPassedTests} Passed</span>
            <span>•</span>
            <span className="text-rose-400 font-medium">{stats.totalFailedTests} Failed</span>
          </div>
        </div>

        {/* Open Defects */}
        <div 
          onClick={() => onNavigate('defects')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Defects</span>
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Bug className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight flex items-baseline space-x-2">
            <span>{stats.openDefects}</span>
            <span className="text-xs font-normal text-slate-400">/ {stats.totalDefects} Total</span>
          </div>
          <div className="mt-1 text-xs text-amber-400">
            <span>Requires triage & resolution</span>
          </div>
        </div>
      </div>

      {/* Coverage Overview Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">Average Statement Coverage</span>
            </div>
            <span className="text-lg font-extrabold font-mono text-indigo-400">
              {stats.avgStatementCoverage}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(stats.avgStatementCoverage, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Measures executable statements reached across all project runs.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Average Branch Coverage</span>
            </div>
            <span className="text-lg font-extrabold font-mono text-emerald-400">
              {stats.avgBranchCoverage}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(stats.avgBranchCoverage, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Measures true/false branch outcomes evaluated in decisions and conditions.
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass / Fail Donut */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-indigo-400" />
                <span>Test Execution Verdict Ratio</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {stats.totalTestCases} Tests Total
              </span>
            </div>

            <div className="h-64 flex items-center justify-center">
              {stats.totalTestCases > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 text-xs">No executed tests found.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Passed Tests</div>
                <div className="text-lg font-bold text-emerald-400">{stats.totalPassedTests}</div>
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Failed / Errors</div>
                <div className="text-lg font-bold text-rose-400">{stats.totalFailedTests}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Black Box Technique Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BarChart className="w-4 h-4 text-sky-400" />
                <span>Test Cases by Technique</span>
              </h3>
              <span className="text-xs text-slate-400">Distribution</span>
            </div>

            <div className="h-64 flex items-center justify-center">
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      dataKey="technique" 
                      stroke="#64748b" 
                      fontSize={11} 
                      angle={-15} 
                      textAnchor="end" 
                    />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 text-xs">No technique data available.</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Includes BVA, Equivalence, Decision Table & White Box</span>
            <button
              onClick={() => onNavigate('black-box')}
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
            >
              <span>Generate More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Latest Test Executions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlayCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Latest Test Runs</h3>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Run Number</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Tests</th>
                <th className="px-5 py-3.5">Passed / Failed</th>
                <th className="px-5 py-3.5">Statement Cov</th>
                <th className="px-5 py-3.5">Branch Cov</th>
                <th className="px-5 py-3.5">Complexity</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Executed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {stats.latestExecutions && stats.latestExecutions.length > 0 ? (
                stats.latestExecutions.map((exec) => (
                  <tr 
                    key={exec.id} 
                    onClick={() => onNavigate('execution-results')}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-400">
                      {exec.executionNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {exec.testType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">{exec.totalTests}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-emerald-400 font-bold">{exec.passedTests}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-rose-400 font-bold">{exec.failedTests}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-indigo-300 font-bold">
                      {exec.statementCoverage}%
                    </td>
                    <td className="px-5 py-3.5 font-mono text-emerald-300 font-bold">
                      {exec.branchCoverage}%
                    </td>
                    <td className="px-5 py-3.5 font-mono text-amber-300 font-bold">
                      M = {exec.cyclomaticComplexity}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {exec.durationMs}ms
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(exec.executedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                    No executions recorded yet. Launch a test run above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Statistics Table & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FolderGit2 className="w-5 h-5 text-indigo-400" />
              <span>Project-Wise Metrics</span>
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              All Projects
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Project Name</th>
                  <th className="px-5 py-3.5">Language</th>
                  <th className="px-5 py-3.5">Tests</th>
                  <th className="px-5 py-3.5">Runs</th>
                  <th className="px-5 py-3.5">Defects</th>
                  <th className="px-5 py-3.5">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {stats.projectStats.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">{p.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {p.language}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">{p.testCount}</td>
                    <td className="px-5 py-3.5">{p.runCount}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-bold ${p.defectCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {p.defectCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-indigo-400 font-bold">
                      {p.statementCoverage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Activity Stream</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {stats.recentActivity.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span className="font-semibold text-indigo-300 uppercase tracking-wider">{act.action}</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-200">{act.details}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            System audit log is persisted to database storage.
          </div>
        </div>
      </div>
    </div>
  );
};
