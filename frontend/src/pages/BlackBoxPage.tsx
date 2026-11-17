import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TestCase } from '../api/types';
import { 
  Boxes, 
  Split, 
  SlidersHorizontal, 
  Table2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface BlackBoxPageProps {
  onNavigate: (view: string) => void;
}

export const BlackBoxPage: React.FC<BlackBoxPageProps> = ({ onNavigate }) => {
  const { selectedProject } = useAuth();
  const [activeTab, setActiveTab] = useState<'EP' | 'BVA' | 'DT' | 'FN'>('EP');

  // Generation status
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedTests, setGeneratedTests] = useState<TestCase[]>([]);

  // 1. Equivalence Partitioning Form
  const [epVariable, setEpVariable] = useState('age');
  const [epDataType, setEpDataType] = useState('INTEGER');
  const [epClasses, setEpClasses] = useState([
    { className: 'Negative Age', rangeDesc: 'age < 0', representativeValue: '-10', isValid: false, expectedOutput: 'Invalid Input: Age cannot be negative' },
    { className: 'Minor Ineligible', rangeDesc: '0 <= age <= 17', representativeValue: '12', isValid: true, expectedOutput: 'Not Eligible' },
    { className: 'Eligible Adult', rangeDesc: '18 <= age <= 120', representativeValue: '28', isValid: true, expectedOutput: 'Eligible' },
    { className: 'Exceeds Lifespan', rangeDesc: 'age > 120', representativeValue: '135', isValid: false, expectedOutput: 'Invalid Input: Age exceeds maximum human lifespan' },
  ]);

  // 2. Boundary Value Analysis Form
  const [bvaVariable, setBvaVariable] = useState('age');
  const [bvaMin, setBvaMin] = useState(0);
  const [bvaMax, setBvaMax] = useState(120);
  const [bvaThreshold, setBvaThreshold] = useState(18);

  // 3. Decision Table Form
  const [dtConditions, setDtConditions] = useState([
    { name: 'Age >= 18', type: 'BOOLEAN' },
    { name: 'Has Valid ID', type: 'BOOLEAN' },
  ]);

  // 4. Custom Functional Test Case Form
  const [fnName, setFnName] = useState('');
  const [fnInput, setFnInput] = useState('');
  const [fnExpected, setFnExpected] = useState('');
  const [fnPreconditions, setFnPreconditions] = useState('');
  const [fnSteps, setFnSteps] = useState('');
  const [fnIsFailureSample, setFnIsFailureSample] = useState(false);

  if (!selectedProject) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Please select a project to generate Black Box test cases.
      </div>
    );
  }

  // Generate EP tests
  const handleGenerateEp = async () => {
    setGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const tests = await api.generateTests(selectedProject.id, {
        technique: 'EQUIVALENCE_PARTITIONING',
        targetVariable: epVariable,
        dataType: epDataType,
        equivalenceClasses: epClasses,
      });
      setGeneratedTests(tests);
      setSuccessMsg(`Generated and saved ${tests.length} Equivalence Partitioning test cases!`);
    } catch (e: any) {
      setErrorMsg(e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // Generate BVA tests
  const handleGenerateBva = async () => {
    setGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const tests = await api.generateTests(selectedProject.id, {
        technique: 'BOUNDARY_VALUE',
        targetVariable: bvaVariable,
        minValue: bvaMin,
        maxValue: bvaMax,
        dataType: 'INTEGER',
        extraBoundaries: [bvaThreshold - 1, bvaThreshold],
      });
      setGeneratedTests(tests);
      setSuccessMsg(`Generated and saved ${tests.length} Boundary Value test cases (-1, 0, 17, 18, 120, 121 boundaries)!`);
    } catch (e: any) {
      setErrorMsg(e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // Generate Decision Table tests
  const handleGenerateDt = async () => {
    setGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const tests = await api.generateTests(selectedProject.id, {
        technique: 'DECISION_TABLE',
        decisionTable: {
          tableName: 'Eligibility Decision Table',
          conditions: dtConditions.map((c) => c.name),
          actions: ['Grant Voter Access', 'Reject / Prompt Guardian'],
        },
      });
      setGeneratedTests(tests);
      setSuccessMsg(`Generated and saved ${tests.length} Decision Table test combinations!`);
    } catch (e: any) {
      setErrorMsg(e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // Add Custom Functional Test
  const handleAddFunctional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fnName.trim() || !fnInput.trim() || !fnExpected.trim()) return;
    setGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const tc = await api.createTestCase(selectedProject.id, {
        testCaseId: `TC-FN-${Date.now().toString().slice(-4)}`,
        name: fnName,
        technique: 'FUNCTIONAL',
        preconditions: fnPreconditions || 'Standard application state',
        inputData: fnInput,
        steps: fnSteps || `Input ${fnInput} and verify result matches ${fnExpected}`,
        expectedResult: fnExpected,
        testType: 'BLACK_BOX',
        isIntentionalFailure: fnIsFailureSample,
      });
      setGeneratedTests([tc]);
      setSuccessMsg(`Created test case: ${tc.name} (${tc.testCaseId})`);
      setFnName('');
      setFnInput('');
      setFnExpected('');
      setFnIsFailureSample(false);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create functional test');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Black Box Testing Module
            </span>
            <span className="text-xs text-slate-400">• Behavioral Test Synthesis</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Black Box Test Case Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Synthesize Equivalence Classes, Boundary Values, Decision Tables, and Functional positive/negative tests.
          </p>
        </div>

        <button
          onClick={() => onNavigate('test-cases')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <span>View All Test Cases</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => onNavigate('test-cases')}
            className="text-xs text-emerald-300 hover:text-white underline font-semibold ml-4"
          >
            Open Test Manager
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Technique Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('EP')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'EP'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Split className="w-4 h-4" />
          <span>Equivalence Partitioning</span>
        </button>

        <button
          onClick={() => setActiveTab('BVA')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'BVA'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Boundary Value Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('DT')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'DT'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Table2 className="w-4 h-4" />
          <span>Decision Table Testing</span>
        </button>

        <button
          onClick={() => setActiveTab('FN')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'FN'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Functional & Error Testing</span>
        </button>
      </div>

      {/* Tab A: Equivalence Partitioning */}
      {activeTab === 'EP' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Split className="w-5 h-5 text-indigo-400" />
              <span>Equivalence Partitioning Test Generator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Divides the input domain into valid and invalid classes where program behavior is assumed identical. Generates 1 representative test case per class.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Parameter</label>
              <input
                type="text"
                value={epVariable}
                onChange={(e) => setEpVariable(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Data Type</label>
              <select
                value={epDataType}
                onChange={(e) => setEpDataType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="INTEGER">Integer Number</option>
                <option value="STRING">String / Text</option>
                <option value="BOOLEAN">Boolean</option>
              </select>
            </div>
          </div>

          {/* Classes Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Partition Class</th>
                  <th className="px-4 py-3">Domain Range</th>
                  <th className="px-4 py-3">Representative Value</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Expected Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {epClasses.map((cls, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">{cls.className}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{cls.rangeDesc}</td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-300">{cls.representativeValue}</td>
                    <td className="px-4 py-3">
                      {cls.isValid ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          VALID
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          INVALID
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{cls.expectedOutput}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateEp}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Synthesize Equivalence Tests</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab B: Boundary Value Analysis */}
      {activeTab === 'BVA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              <span>Boundary Value Analysis (BVA)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Generates test cases on and immediately adjacent to boundaries: min-1, min, min+1, cutoff boundaries (17, 18), max-1, max, max+1.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Parameter</label>
              <input
                type="text"
                value={bvaVariable}
                onChange={(e) => setBvaVariable(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Boundary (min)</label>
              <input
                type="number"
                value={bvaMin}
                onChange={(e) => setBvaMin(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Maximum Boundary (max)</label>
              <input
                type="number"
                value={bvaMax}
                onChange={(e) => setBvaMax(parseInt(e.target.value) || 120)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Generated Boundaries Preview */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Computed Test Points for Age Eligibility Demo (-1, 0, 17, 18, 120, 121)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-center">
                <div className="text-[10px] text-rose-300 font-bold">Min - 1 (Invalid)</div>
                <div className="text-lg font-mono font-extrabold text-white mt-1">-1</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-center">
                <div className="text-[10px] text-emerald-300 font-bold">Min Boundary</div>
                <div className="text-lg font-mono font-extrabold text-white mt-1">0</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800 text-center">
                <div className="text-[10px] text-amber-300 font-bold">Cutoff Boundary</div>
                <div className="text-lg font-mono font-extrabold text-white mt-1">17</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-center">
                <div className="text-[10px] text-emerald-300 font-bold">Eligible Threshold</div>
                <div className="text-lg font-mono font-extrabold text-white mt-1">18</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-center">
                <div className="text-[10px] text-emerald-300 font-bold">Max Boundary</div>
                <div className="text-lg font-mono font-extrabold text-white mt-1">120</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-center">
                <div className="text-[10px] text-rose-300 font-bold">Max + 1 (Invalid)</div>
                <div className="text-lg font-mono font-extrabold text-white mt-1">121</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateBva}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Boundary Test Cases</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab C: Decision Table Testing */}
      {activeTab === 'DT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Table2 className="w-5 h-5 text-indigo-400" />
              <span>Decision Table Combinations (2^N)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Models complex business rules with boolean condition combinations and expected action rules.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300">Configured Rule Conditions:</div>
            <div className="flex items-center space-x-2">
              {dtConditions.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-indigo-300 border border-slate-700">
                  C{i + 1}: {c.name}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Produces 4 exhaustive decision rules (TT, TF, FT, FF) mapped to actions.
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateDt}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Synthesize Decision Table Tests</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab D: Functional & Positive/Negative Test Generator */}
      {activeTab === 'FN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Custom Functional & Negative Test Designer</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add individual behavioral tests with explicit test inputs, expected outputs, and error test cases.
            </p>
          </div>

          <form onSubmit={handleAddFunctional} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Citizen Voter Boundary (Age 75)"
                  value={fnName}
                  onChange={(e) => setFnName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Input Data *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 75 or negative input -50"
                  value={fnInput}
                  onChange={(e) => setFnInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Result *</label>
              <input
                type="text"
                required
                placeholder="e.g. Eligible or Invalid Input: Age cannot be negative"
                value={fnExpected}
                onChange={(e) => setFnExpected(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preconditions</label>
                <input
                  type="text"
                  placeholder="e.g. Valid input range"
                  value={fnPreconditions}
                  onChange={(e) => setFnPreconditions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Test Steps</label>
                <input
                  type="text"
                  placeholder="e.g. 1. Pass input to validator. 2. Compare returned string."
                  value={fnSteps}
                  onChange={(e) => setFnSteps(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Clearly Labeled Intentional Failure Demonstration Toggle */}
            <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl flex items-start space-x-3">
              <input
                type="checkbox"
                id="fnFailureToggle"
                checked={fnIsFailureSample}
                onChange={(e) => setFnIsFailureSample(e.target.checked)}
                className="mt-0.5 rounded border-amber-600 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="fnFailureToggle" className="cursor-pointer text-xs">
                <span className="font-bold text-amber-300">
                  Label as Demonstration Failure (Intentional Mismatch Sample)
                </span>
                <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                  Checking this clearly flags the test case as an intentional test failure to demonstrate how TestFusion detects assertion discrepancies and allows 1-click defect logging.
                </p>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={generating}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Add Test Case</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
