import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ExecutionSummary } from '../api/types';
import { X, Play, Loader2, Binary, Boxes, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RunTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutionComplete: (summary: ExecutionSummary) => void;
}

export const RunTestsModal: React.FC<RunTestsModalProps> = ({
  isOpen,
  onClose,
  onExecutionComplete,
}) => {
  const { selectedProject } = useAuth();
  const [testType, setTestType] = useState<'INTEGRATED' | 'WHITE_BOX' | 'BLACK_BOX'>('INTEGRATED');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !selectedProject) return null;

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const summary = await api.runTests(selectedProject.id, { testType });
      setRunning(false);
      onExecutionComplete(summary);
      onClose();
    } catch (err: any) {
      setRunning(false);
      setError(err.message || 'Execution failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          disabled={running}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Play className="w-5 h-5 fill-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Execute Test Suite</h3>
            <p className="text-xs text-slate-400">
              Run automated tests for <span className="text-indigo-300 font-semibold">{selectedProject.name}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Testing Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTestType('INTEGRATED')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  testType === 'INTEGRATED'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-lg shadow-indigo-600/10'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Layers className={`w-5 h-5 ${testType === 'INTEGRATED' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold">Integrated</span>
                <span className="text-[10px] text-slate-400">White + Black Box</span>
              </button>

              <button
                type="button"
                onClick={() => setTestType('WHITE_BOX')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  testType === 'WHITE_BOX'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-lg shadow-indigo-600/10'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Binary className={`w-5 h-5 ${testType === 'WHITE_BOX' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold">White Box</span>
                <span className="text-[10px] text-slate-400">Branches & Coverage</span>
              </button>

              <button
                type="button"
                onClick={() => setTestType('BLACK_BOX')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  testType === 'BLACK_BOX'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-lg shadow-indigo-600/10'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Boxes className={`w-5 h-5 ${testType === 'BLACK_BOX' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold">Black Box</span>
                <span className="text-[10px] text-slate-400">EP, BVA & Functional</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Execution Environment:</span>
              <span className="font-mono text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Isolated JVM Sandbox (128MB, 6s timeout)</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Instrumentation:</span>
              <span className="font-mono text-indigo-300">Statement & Branch Tracking</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Sample Failure Support:</span>
              <span className="text-amber-400 font-medium">Intentional defect samples preserved</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={running}
            className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Tests...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Execution</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
