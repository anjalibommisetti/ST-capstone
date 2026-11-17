import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TestExecution, ExecutionComparison } from '../api/types';
import { 
  History, 
  GitCompare, 
  FileDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  X,
  RefreshCw
} from 'lucide-react';

interface TestHistoryPageProps {
  onNavigate: (view: string) => void;
}

export const TestHistoryPage: React.FC<TestHistoryPageProps> = ({ onNavigate }) => {
  const { selectedProject } = useAuth();
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comparison state
  const [runAId, setRunAId] = useState<number | null>(null);
  const [runBId, setRunBId] = useState<number | null>(null);
  const [comparison, setComparison] = useState<ExecutionComparison | null>(null);
  const [comparing, setComparing] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const loadHistory = async () => {
    if (!selectedProject) return;
    setLoading(true);
    setError(null);
    try {
      const list = await api.getProjectHistory(selectedProject.id);
      setExecutions(list);
      if (list.length >= 2) {
        setRunAId(list[1].id);
        setRunBId(list[0].id);
      } else if (list.length === 1) {
        setRunAId(list[0].id);
        setRunBId(list[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load execution history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedProject]);

  const handleCompare = async () => {
    if (!runAId || !runBId) return;
    setComparing(true);
    try {
      const comp = await api.compareExecutions(runAId, runBId);
      setComparison(comp);
      setCompareModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  const handleDownloadCsv = (execId: number) => {
    api.downloadCsv(api.getExecutionCsvUrl(execId), `testfusion_execution_${execId}.csv`);
  };

  if (!selectedProject) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Please select a project to view its test execution history.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Execution Timeline
            </span>
            <span className="text-xs text-slate-400">• {executions.length} Total Executions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Test Execution History & Compare
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track regression trends and compare deltas between test execution runs.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all self-start sm:self-auto"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Compare Tool Card */}
      {executions.length >= 2 && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <GitCompare className="w-4 h-4" />
            <span>Differential Run Comparison</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Baseline Run (A)</label>
              <select
                value={runAId || ''}
                onChange={(e) => setRunAId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              >
                {executions.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.executionNumber} ({x.testType}) - {new Date(x.executedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center pt-4 sm:pt-0">
              <span className="text-slate-500 font-bold text-xs">VS</span>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Run (B)</label>
              <select
                value={runBId || ''}
                onChange={(e) => setRunBId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              >
                {executions.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.executionNumber} ({x.testType}) - {new Date(x.executedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCompare}
              disabled={comparing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all self-end disabled:opacity-50 mt-2 sm:mt-0"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Runs</span>
            </button>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Execution #</th>
                <th className="px-5 py-3.5">Testing Mode</th>
                <th className="px-5 py-3.5">Total Tests</th>
                <th className="px-5 py-3.5">Passed / Failed</th>
                <th className="px-5 py-3.5">Statement Cov</th>
                <th className="px-5 py-3.5">Branch Cov</th>
                <th className="px-5 py-3.5">Complexity</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-500">
                    Loading execution history...
                  </td>
                </tr>
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-500">
                    No executions recorded yet.
                  </td>
                </tr>
              ) : (
                executions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-800/40 transition-colors">
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
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDownloadCsv(exec.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="Download CSV Trace"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      {compareModalOpen && comparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCompareModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4" />
              <span>Differential Analysis</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">
              Comparison: {comparison.runA.executionNumber} vs {comparison.runB.executionNumber}
            </h3>

            {/* Delta Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Delta Passed</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  comparison.deltaPassed >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {comparison.deltaPassed >= 0 ? `+${comparison.deltaPassed}` : comparison.deltaPassed}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Delta Failed</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  comparison.deltaFailed <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {comparison.deltaFailed > 0 ? `+${comparison.deltaFailed}` : comparison.deltaFailed}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Statement Cov Δ</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  comparison.deltaStatementCoverage >= 0 ? 'text-indigo-400' : 'text-rose-400'
                }`}>
                  {comparison.deltaStatementCoverage >= 0 ? `+${comparison.deltaStatementCoverage}%` : `${comparison.deltaStatementCoverage}%`}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Branch Cov Δ</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  comparison.deltaBranchCoverage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {comparison.deltaBranchCoverage >= 0 ? `+${comparison.deltaBranchCoverage}%` : `${comparison.deltaBranchCoverage}%`}
                </div>
              </div>
            </div>

            {/* Status Changes */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Test Case Status Discrepancies ({comparison.statusChanges.length})
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {comparison.statusChanges.length > 0 ? (
                  comparison.statusChanges.map((sc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-indigo-400 mr-2">{sc.testCaseId}</span>
                        <span className="text-slate-300">{sc.testName}</span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono font-bold text-xs">
                        <span className={sc.previousStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>
                          {sc.previousStatus}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className={sc.newStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>
                          {sc.newStatus}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
                    No individual test verdict changes detected between these two executions.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
