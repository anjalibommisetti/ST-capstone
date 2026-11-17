import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ExecutionSummary, Defect, IndividualResult } from '../api/types';
import { 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Binary, 
  Layers, 
  Percent, 
  Bug, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCw,
  FileDown,
  X,
  AlertCircle
} from 'lucide-react';

interface ExecutionResultsPageProps {
  onNavigate: (view: string) => void;
  onOpenRunModal: () => void;
  latestSummary?: ExecutionSummary | null;
}

export const ExecutionResultsPage: React.FC<ExecutionResultsPageProps> = ({ 
  onNavigate, 
  onOpenRunModal,
  latestSummary 
}) => {
  const { selectedProject } = useAuth();
  const [summary, setSummary] = useState<ExecutionSummary | null>(latestSummary || null);
  const [loading, setLoading] = useState(!latestSummary);
  const [error, setError] = useState<string | null>(null);

  // Defect logging modal from failed test
  const [defectModalOpen, setDefectModalOpen] = useState(false);
  const [defectTc, setDefectTc] = useState<IndividualResult | null>(null);
  const [defectTitle, setDefectTitle] = useState('');
  const [defectDesc, setDefectDesc] = useState('');
  const [defectSeverity, setDefectSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [defectMessage, setDefectMessage] = useState<string | null>(null);

  const loadLatestExecution = async () => {
    if (!selectedProject) return;
    setLoading(true);
    setError(null);
    try {
      const runs = await api.getProjectHistory(selectedProject.id);
      if (runs.length > 0) {
        const full = await api.getExecution(runs[0].id);
        setSummary(full);
      } else {
        setSummary(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load execution results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latestSummary) {
      setSummary(latestSummary);
      setLoading(false);
    } else {
      loadLatestExecution();
    }
  }, [selectedProject, latestSummary]);

  const handleOpenLogDefect = (res: IndividualResult) => {
    setDefectTc(res);
    setDefectTitle(`Test Failure in ${res.testCaseId}: ${res.testName}`);
    setDefectDesc(`Expected: "${res.expectedResult}"\nActual: "${res.actualResult}"\nInput: ${res.inputData}`);
    setDefectSeverity(res.intentionalFailure ? 'LOW' : 'HIGH');
    setDefectModalOpen(true);
  };

  const handleSubmitDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !defectTc) return;
    try {
      await api.createDefect(selectedProject.id, {
        title: defectTitle,
        description: defectDesc,
        expectedResult: defectTc.expectedResult,
        actualResult: defectTc.actualResult,
        stepsToReproduce: `Execute test case ${defectTc.testCaseId} with input: ${defectTc.inputData}`,
        severity: defectSeverity,
        status: 'OPEN',
      }, defectTc.testCaseDbId);

      setDefectModalOpen(false);
      setDefectMessage(`Defect logged successfully for ${defectTc.testCaseId}!`);
      setTimeout(() => setDefectMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to log defect');
    }
  };

  const handleDownloadCsv = () => {
    if (!summary) return;
    api.downloadCsv(api.getExecutionCsvUrl(summary.executionId), `testfusion_run_${summary.executionNumber}.csv`);
  };

  if (!selectedProject) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Please select a project to view test execution results.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Retrieving test execution metrics and trace...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl max-w-lg mx-auto my-12 shadow-xl">
        <PlayCircle className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Executions Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          Execute your first test run to view unified White Box & Black Box metrics.
        </p>
        <button
          onClick={onOpenRunModal}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
        >
          Run Tests Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              {summary.executionNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              {summary.testType} MODE
            </span>
            <span className="text-xs text-slate-400">
              • Executed on {new Date(summary.executedAt).toLocaleString()}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Test Execution Results
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Unified testing report combining White Box structural metrics and Black Box behavioral assertions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenRunModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center space-x-1.5 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Run Again</span>
          </button>
        </div>
      </div>

      {defectMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
          <span>{defectMessage}</span>
          <button onClick={() => setDefectMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Tests</div>
          <div className="mt-1 text-2xl font-extrabold text-white">{summary.totalTests}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase">Passed</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{summary.passedTests}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-rose-400 uppercase">Failed</div>
          <div className="mt-1 text-2xl font-extrabold text-rose-400 flex items-center space-x-1">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>{summary.failedTests}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-indigo-400 uppercase">Statement Cov</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-indigo-400">
            {summary.statementCoverage}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-teal-400 uppercase">Branch Cov</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-teal-400">
            {summary.branchCoverage}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-amber-400 uppercase">Complexity</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-amber-400">
            M = {summary.cyclomaticComplexity}
          </div>
        </div>
      </div>

      {/* Individual Test Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Test Case Assertions & Outcomes</span>
          </h3>
          <span className="text-xs text-slate-400">
            Execution Duration: <span className="font-mono text-white font-bold">{summary.durationMs}ms</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Test Case ID</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Technique</th>
                <th className="px-5 py-3.5">Input</th>
                <th className="px-5 py-3.5">Expected</th>
                <th className="px-5 py-3.5">Actual Result</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {summary.results.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-indigo-400">
                    {r.testCaseId}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-white">{r.testName}</div>
                    {r.intentionalFailure && (
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800 mt-0.5">
                        INTENTIONAL FAILURE DEMO
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                    {r.technique.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-white max-w-[100px] truncate">
                    {r.inputData}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-emerald-300 max-w-[160px] truncate">
                    {r.expectedResult}
                  </td>
                  <td className="px-5 py-3.5 font-mono max-w-[160px] truncate text-slate-300">
                    {r.actualResult}
                  </td>
                  <td className="px-5 py-3.5">
                    {r.status === 'PASS' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center space-x-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        <span>FAIL</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {r.executionTimeMs}ms
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {r.status === 'FAIL' && (
                      <button
                        onClick={() => handleOpenLogDefect(r)}
                        className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/60 font-semibold text-[11px] inline-flex items-center space-x-1"
                      >
                        <Bug className="w-3 h-3" />
                        <span>Log Defect</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uncovered Branches & Automated Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Uncovered Code Areas & Branches</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="font-semibold text-slate-200">Uncovered Statements:</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {summary.uncoveredLines && summary.uncoveredLines.length > 0 
                  ? `Lines: ${summary.uncoveredLines.join(', ')}` 
                  : 'All primary method statements were covered!'}
              </div>
            </div>

            <div className="pt-2">
              <div className="font-semibold text-slate-200">Uncovered Decisions / Fallthroughs:</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {summary.uncoveredBranches && summary.uncoveredBranches.length > 0 
                  ? summary.uncoveredBranches.join('; ') 
                  : 'All condition branches evaluated during this execution!'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Automated Testing Recommendations</span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            {summary.recommendations && summary.recommendations.length > 0 ? (
              summary.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))
            ) : (
              <>
                <li>Execute boundary tests at threshold boundaries 17 and 18 to confirm adult age transition.</li>
                <li>Add negative tests for invalid large inputs (&gt;120) to maintain 100% branch coverage.</li>
                <li>Triage failing test case TC-FAIL-01 and verify if logic specification matches expected result.</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Log Defect Modal */}
      {defectModalOpen && defectTc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setDefectModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Bug className="w-4 h-4" />
              <span>Log Defect from Test Failure</span>
            </div>
            <h3 className="text-base font-bold text-white mb-4">Create Defect Record</h3>

            <form onSubmit={handleSubmitDefect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Defect Title *</label>
                <input
                  type="text"
                  required
                  value={defectTitle}
                  onChange={(e) => setDefectTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                <select
                  value={defectSeverity}
                  onChange={(e) => setDefectSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                >
                  <option value="CRITICAL">Critical (System Blocker)</option>
                  <option value="HIGH">High (Major functional issue)</option>
                  <option value="MEDIUM">Medium (Assertion discrepancy)</option>
                  <option value="LOW">Low (Minor/Demo failure)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={defectDesc}
                  onChange={(e) => setDefectDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Linked Test: <span className="font-mono text-indigo-300 font-bold">{defectTc.testCaseId}</span></div>
                <div>Actual Result: <span className="font-mono text-rose-400">{defectTc.actualResult}</span></div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDefectModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-rose-600/25"
                >
                  Confirm & Log Defect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
