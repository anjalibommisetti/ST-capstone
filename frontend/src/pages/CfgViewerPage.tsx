import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { WhiteBoxAnalysisResult, IndependentPath } from '../api/types';
import { CfgGraph } from '../components/CfgGraph';
import { 
  GitFork, 
  Layers, 
  CheckCircle2, 
  Route, 
  ArrowRight, 
  RefreshCw, 
  Info,
  Plus
} from 'lucide-react';

interface CfgViewerPageProps {
  onNavigate: (view: string) => void;
}

export const CfgViewerPage: React.FC<CfgViewerPageProps> = ({ onNavigate }) => {
  const { selectedProject } = useAuth();
  const [analysis, setAnalysis] = useState<WhiteBoxAnalysisResult | null>(null);
  const [selectedPath, setSelectedPath] = useState<IndependentPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pathCreatedMessage, setPathCreatedMessage] = useState<string | null>(null);

  const loadCfg = async () => {
    if (!selectedProject) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeProject(selectedProject.id);
      setAnalysis(res);
      if (res.independentPaths && res.independentPaths.length > 0) {
        setSelectedPath(res.independentPaths[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load Control Flow Graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCfg();
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Please select a project to view its Control Flow Graph.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="text-sm text-slate-400">Constructing Control Flow Graph from AST...</p>
      </div>
    );
  }

  const handleCreateTestForPath = async (p: IndependentPath) => {
    if (!selectedProject) return;
    try {
      await api.createTestCase(selectedProject.id, {
        testCaseId: `TC-PATH-${p.pathNumber}`,
        name: `Path ${p.pathNumber}: ${p.description.substring(0, 40)}`,
        technique: 'BASIS_PATH',
        preconditions: `Exercising nodes: ${p.nodeIds.join(' -> ')}`,
        inputData: p.conditionsExercised.join(', '),
        steps: `Traverse nodes: ${p.nodeIds.join(', ')}`,
        expectedResult: 'Branch executed successfully',
        testType: 'WHITE_BOX',
      });
      setPathCreatedMessage(`Test case TC-PATH-${p.pathNumber} created in Test Case Manager!`);
      setTimeout(() => setPathCreatedMessage(null), 4000);
    } catch (e: any) {
      setError(e.message || 'Failed to create test for path');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
              Control Flow Visualization
            </span>
            <span className="text-xs text-slate-400">• Directed AST Graph</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Control Flow Graph & Basis Paths
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualizes statement nodes, decision branching, and McCabe's linearly independent paths.
          </p>
        </div>

        <button
          onClick={loadCfg}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all self-start sm:self-auto"
          title="Reload Graph"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {pathCreatedMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{pathCreatedMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Main Interactive Graph */}
      {analysis && analysis.cfgNodes && analysis.cfgNodes.length > 0 ? (
        <CfgGraph
          nodes={analysis.cfgNodes}
          edges={analysis.cfgEdges}
          highlightedNodeIds={selectedPath ? selectedPath.nodeIds : []}
        />
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          No control flow nodes available. Make sure the Java source code contains methods and valid syntax.
        </div>
      )}

      {/* McCabe Basis Independent Paths Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Route className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">McCabe Basis Independent Paths</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {analysis?.independentPaths?.length || 0} Independent Paths
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          A basis set of execution paths where each path introduces at least one new edge that is not included in any other path. Click a path below to highlight it on the diagram.
        </p>

        <div className="space-y-3">
          {analysis?.independentPaths?.map((p) => {
            const isSelected = selectedPath?.pathNumber === p.pathNumber;
            return (
              <div
                key={p.pathNumber}
                onClick={() => setSelectedPath(p)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/40'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800">
                      Path #{p.pathNumber}
                    </span>
                    <span className="font-semibold text-slate-200 text-xs">{p.description}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5 flex-wrap">
                    <span className="text-slate-500">Node Traversal:</span>
                    <span className="text-sky-300 font-semibold">{p.nodeIds.join(' -> ')}</span>
                  </div>

                  <div className="text-[10px] text-amber-300 font-mono">
                    Conditions: {p.conditionsExercised.join('; ')}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateTestForPath(p);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Test</span>
                  </button>
                  {isSelected && (
                    <span className="text-xs text-indigo-400 font-semibold hidden sm:inline">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
