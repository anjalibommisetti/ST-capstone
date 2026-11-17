import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SourceFile, WhiteBoxAnalysisResult } from '../api/types';
import { 
  FileCode, 
  Save, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Code2, 
  Sparkles,
  Loader2,
  GitFork
} from 'lucide-react';

const SAMPLE_AGE_VALIDATOR_CODE = `package com.testfusion.demo;

public class AgeValidator {
    
    /**
     * Validates voting / registration eligibility based on age.
     * Logic:
     *  - Age < 0: Invalid Input (Negative age)
     *  - Age from 0 to 17: Not Eligible (Underage)
     *  - Age from 18 to 120: Eligible (Standard adult voter)
     *  - Age > 120: Invalid Input (Exceeds verified human lifespan)
     */
    public String checkEligibility(int age) {
        if (age < 0) {
            return "Invalid Input: Age cannot be negative";
        } else if (age <= 17) {
            return "Not Eligible";
        } else if (age <= 120) {
            return "Eligible";
        } else {
            return "Invalid Input: Age exceeds maximum human lifespan";
        }
    }
    
    public static void main(String[] args) {
        AgeValidator validator = new AgeValidator();
        System.out.println("Eligibility for age 18: " + validator.checkEligibility(18));
    }
}
`;

interface CodeEditorPageProps {
  onNavigate: (view: string) => void;
}

export const CodeEditorPage: React.FC<CodeEditorPageProps> = ({ onNavigate }) => {
  const { selectedProject } = useAuth();
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<SourceFile | null>(null);
  const [code, setCode] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WhiteBoxAnalysisResult | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProject) return;
    const loadFiles = async () => {
      try {
        const files = await api.getSourceFiles(selectedProject.id);
        setSourceFiles(files);
        if (files.length > 0) {
          setSelectedFile(files[0]);
          setCode(files[0].content);
        } else {
          setCode(SAMPLE_AGE_VALIDATOR_CODE);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load source files');
      }
    };
    loadFiles();
  }, [selectedProject]);

  const handleSave = async () => {
    if (!selectedProject || !selectedFile) return;
    setSaving(true);
    setSaveMessage(null);
    setErrorMessage(null);
    try {
      const updated = await api.updateSourceFile(selectedProject.id, selectedFile.id, code);
      setSelectedFile(updated);
      setSaveMessage('File saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save code');
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setErrorMessage(null);
    try {
      const result = await api.analyzeSource(code);
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'AST Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadDemo = () => {
    setCode(SAMPLE_AGE_VALIDATOR_CODE);
    setAnalysisResult(null);
  };

  if (!selectedProject) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Please select a project from the top navigation to edit code.
      </div>
    );
  }

  const lines = code.split('\n');

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <FileCode className="w-6 h-6 text-indigo-400" />
            <span>Source Code Editor</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Write or inspect Java target classes. Analyze AST syntax, identify branches, and test code logic.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleLoadDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            title="Load Age Eligibility Sample Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Demo Code</span>
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Analyze AST</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !selectedFile}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save File</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Editor & File Tab */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Editor Tab Bar */}
        <div className="h-11 bg-slate-950/80 border-b border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-slate-800 border-t-2 border-indigo-500 rounded-t text-xs font-mono font-bold text-white flex items-center space-x-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{selectedFile ? selectedFile.fileName : 'AgeValidator.java'}</span>
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {lines.length} lines • Java Target
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="flex bg-[#0b0f19] min-h-[460px] font-mono text-xs leading-relaxed overflow-x-auto">
          {/* Line Numbers */}
          <div className="py-4 px-3 bg-slate-950/60 text-slate-400 select-none text-right font-mono border-r border-slate-800/80">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-4 bg-transparent text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-indigo-600/40"
            rows={Math.max(lines.length + 2, 22)}
          />
        </div>
      </div>

      {/* Real-Time AST Analysis Feedback */}
      {analysisResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">AST Analysis & Syntax Validation</h3>
            </div>
            <button
              onClick={() => onNavigate('cfg')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center space-x-1 border border-indigo-500/30"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Inspect Full CFG Graph</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">Syntax Status</div>
              <div className="text-base font-bold text-emerald-400 mt-1">Valid Syntax</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">Executable Statements</div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {analysisResult.totalStatements}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">Decision Points</div>
              <div className="text-base font-bold text-amber-400 font-mono mt-1">
                {analysisResult.totalDecisions}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">Cyclomatic Complexity</div>
              <div className="text-base font-bold text-indigo-400 font-mono mt-1">
                M = {analysisResult.cyclomaticMetric?.complexity || 1}
              </div>
            </div>
          </div>

          {analysisResult.methods && analysisResult.methods.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-300 mb-2">Detected Methods:</div>
              <div className="space-y-1.5">
                {analysisResult.methods.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-indigo-300">{m.returnType} {m.name}</span>
                      <span className="text-slate-400 font-mono">({m.parameters.join(', ')})</span>
                      <span className="text-slate-400 ml-2">Lines {m.startLine}-{m.endLine}</span>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold">
                      Complexity: {m.cyclomaticComplexity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
