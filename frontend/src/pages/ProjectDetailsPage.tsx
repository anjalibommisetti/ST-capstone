import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SourceFile, TestCase, TestExecution, Defect } from '../api/types';
import { 
  FolderGit2, 
  FileCode, 
  Play, 
  Binary, 
  Boxes, 
  GitFork, 
  ListTodo, 
  Bug, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';

interface ProjectDetailsPageProps {
  onNavigate: (view: string) => void;
  onOpenRunModal: () => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ onNavigate, onOpenRunModal }) => {
  const { selectedProject } = useAuth();
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const [files, tests, runs, defs] = await Promise.all([
          api.getSourceFiles(selectedProject.id),
          api.getProjectTests(selectedProject.id),
          api.getProjectHistory(selectedProject.id),
          api.getProjectDefects(selectedProject.id),
        ]);
        setSourceFiles(files);
        setTestCases(tests);
        setExecutions(runs);
        setDefects(defs);
      } catch (e) {
        console.error('Failed to load project details', e);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        No project selected. Please select or create a project first.
      </div>
    );
  }

  const passedTests = testCases.filter((t) => t.status === 'PASS').length;
  const failedTests = testCases.filter((t) => t.status === 'FAIL').length;
  const latestRun = executions.length > 0 ? executions[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Project Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              PROJECT #{selectedProject.id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              {selectedProject.language}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            {selectedProject.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {selectedProject.description || 'Target software testing project.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('code-editor')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>Open Code Editor</span>
          </button>
          <button
            onClick={onOpenRunModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run All Tests</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Suite Size</div>
          <div className="mt-2 text-3xl font-extrabold text-white">{testCases.length}</div>
          <div className="mt-1 text-xs text-slate-400 flex items-center space-x-2">
            <span className="text-emerald-400 font-semibold">{passedTests} Pass</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{failedTests} Fail</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Statement Coverage</div>
          <div className="mt-2 text-3xl font-extrabold text-indigo-400 font-mono">
            {latestRun ? `${latestRun.statementCoverage}%` : 'N/A'}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {latestRun ? `From run ${latestRun.executionNumber}` : 'Requires first execution run'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch Coverage</div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400 font-mono">
            {latestRun ? `${latestRun.branchCoverage}%` : 'N/A'}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {latestRun ? `Branch decisions tracked` : 'Requires first execution run'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Defects</div>
          <div className="mt-2 text-3xl font-extrabold text-amber-400">
            {defects.filter((d) => d.status !== 'CLOSED').length}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {defects.length} Total defects logged
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Integrated Testing Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            onClick={() => onNavigate('white-box')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                <Binary className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">White Box Testing</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                AST method breakdown, decision points, McCabe cyclomatic complexity (M = E - N + 2P), and statement/branch instrumentation.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs text-indigo-400 font-semibold">
              <span>Inspect Source Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('cfg')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-600/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 transition-transform">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Control Flow Graph</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Interactive SVG graph rendering of statements, decision nodes, and basis independent path sequence highlighting.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs text-sky-400 font-semibold">
              <span>View Graph & Paths</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('black-box')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Black Box Testing</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automated generators for Equivalence Partitioning, Boundary Value Analysis, Decision Tables, and positive/negative test suites.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
              <span>Generate Test Cases</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Source Files Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Source Files</h3>
          </div>
          <button
            onClick={() => onNavigate('code-editor')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
          >
            <span>Open in Editor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">File Name</th>
                <th className="px-5 py-3.5">Path</th>
                <th className="px-5 py-3.5">Package</th>
                <th className="px-5 py-3.5">Size (Lines)</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {sourceFiles.length > 0 ? (
                sourceFiles.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-bold text-white font-mono">{f.fileName}</td>
                    <td className="px-5 py-3.5 text-slate-400">{f.filePath}</td>
                    <td className="px-5 py-3.5 text-slate-400">{f.packagePath || 'default'}</td>
                    <td className="px-5 py-3.5 font-mono">{f.content ? f.content.split('\n').length : 0} lines</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onNavigate('code-editor')}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium"
                      >
                        Edit Code
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-500">
                    No source files found in this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
