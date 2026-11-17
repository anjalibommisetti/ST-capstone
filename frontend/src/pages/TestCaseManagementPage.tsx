import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TestCase } from '../api/types';
import { 
  ListTodo, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Bug,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface TestCaseManagementPageProps {
  onNavigate: (view: string) => void;
  onOpenRunModal: () => void;
}

export const TestCaseManagementPage: React.FC<TestCaseManagementPageProps> = ({ 
  onNavigate,
  onOpenRunModal
}) => {
  const { selectedProject } = useAuth();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTechnique, setFilterTechnique] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTc, setSelectedTc] = useState<TestCase | null>(null);

  // Form states
  const [formTcId, setFormTcId] = useState('');
  const [formName, setFormName] = useState('');
  const [formTechnique, setFormTechnique] = useState('BOUNDARY_VALUE');
  const [formPreconditions, setFormPreconditions] = useState('');
  const [formInputData, setFormInputData] = useState('');
  const [formSteps, setFormSteps] = useState('');
  const [formExpected, setFormExpected] = useState('');
  const [formTestType, setFormTestType] = useState<'WHITE_BOX' | 'BLACK_BOX' | 'INTEGRATED'>('BLACK_BOX');
  const [formIntentionalFailure, setFormIntentionalFailure] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadTests = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const list = await api.getProjectTests(selectedProject.id);
      setTestCases(list);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to load test cases' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [selectedProject]);

  const handleAddTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !formName.trim() || !formExpected.trim()) return;
    try {
      const newTc = await api.createTestCase(selectedProject.id, {
        testCaseId: formTcId || `TC-MAN-${Date.now().toString().slice(-4)}`,
        name: formName,
        technique: formTechnique,
        preconditions: formPreconditions,
        inputData: formInputData,
        steps: formSteps,
        expectedResult: formExpected,
        testType: formTestType,
        isIntentionalFailure: formIntentionalFailure,
      });
      setIsAddOpen(false);
      resetForm();
      setNotification({ type: 'success', message: `Added test case: ${newTc.testCaseId}` });
      await loadTests();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to add test case' });
    }
  };

  const handleEditTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTc || !formName.trim() || !formExpected.trim()) return;
    try {
      await api.updateTestCase(selectedTc.id, {
        name: formName,
        technique: formTechnique,
        preconditions: formPreconditions,
        inputData: formInputData,
        steps: formSteps,
        expectedResult: formExpected,
        testType: formTestType,
        isIntentionalFailure: formIntentionalFailure,
      });
      setIsEditOpen(false);
      setSelectedTc(null);
      resetForm();
      setNotification({ type: 'success', message: 'Test case updated successfully' });
      await loadTests();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update test case' });
    }
  };

  const handleDeleteTestCase = async () => {
    if (!selectedTc) return;
    try {
      await api.deleteTestCase(selectedTc.id);
      setIsDeleteOpen(false);
      setSelectedTc(null);
      setNotification({ type: 'success', message: 'Test case deleted' });
      await loadTests();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete test case' });
    }
  };

  const openEditModal = (tc: TestCase) => {
    setSelectedTc(tc);
    setFormTcId(tc.testCaseId);
    setFormName(tc.name);
    setFormTechnique(tc.technique);
    setFormPreconditions(tc.preconditions || '');
    setFormInputData(tc.inputData || '');
    setFormSteps(tc.steps || '');
    setFormExpected(tc.expectedResult);
    setFormTestType(tc.testType);
    setFormIntentionalFailure(Boolean(tc.isIntentionalFailure));
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormTcId('');
    setFormName('');
    setFormTechnique('BOUNDARY_VALUE');
    setFormPreconditions('');
    setFormInputData('');
    setFormSteps('');
    setFormExpected('');
    setFormTestType('BLACK_BOX');
    setFormIntentionalFailure(false);
  };

  // Filter logic
  const filtered = testCases.filter((tc) => {
    const matchesSearch =
      tc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.testCaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tc.inputData && tc.inputData.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTechnique = filterTechnique === 'ALL' || tc.technique === filterTechnique;
    const matchesStatus = filterStatus === 'ALL' || tc.status === filterStatus;

    return matchesSearch && matchesTechnique && matchesStatus;
  });

  if (!selectedProject) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Please select a project to manage its test cases.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Test Case Repository
            </span>
            <span className="text-xs text-slate-400">• {testCases.length} Total Defined</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Test Case Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, edit, organize, and execute automated test suites.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadTests}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Refresh Tests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test Case</span>
          </button>
          <button
            onClick={onOpenRunModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center space-x-1.5 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run All Tests</span>
          </button>
        </div>
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

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by test ID, name, input..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Technique:</span>
            <select
              value={filterTechnique}
              onChange={(e) => setFilterTechnique(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Techniques</option>
              <option value="BOUNDARY_VALUE">Boundary Value Analysis</option>
              <option value="EQUIVALENCE_PARTITIONING">Equivalence Partitioning</option>
              <option value="DECISION_TABLE">Decision Table</option>
              <option value="FUNCTIONAL">Functional Testing</option>
              <option value="WHITE_BOX_BRANCH">White Box Branch</option>
              <option value="BASIS_PATH">Basis Path</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASS">Passed (PASS)</option>
              <option value="FAIL">Failed (FAIL)</option>
              <option value="NOT_RUN">Not Run</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Test Case ID</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Technique</th>
                <th className="px-5 py-3.5">Input Data</th>
                <th className="px-5 py-3.5">Expected Output</th>
                <th className="px-5 py-3.5">Actual Output</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                    Loading test cases...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                    No test cases match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-400">
                      {tc.testCaseId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{tc.name}</div>
                      {tc.isIntentionalFailure && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800 mt-0.5">
                          DEMO FAILURE SAMPLE
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                      {tc.technique.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-200 max-w-[120px] truncate">
                      {tc.inputData}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-emerald-300 max-w-[180px] truncate">
                      {tc.expectedResult}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400 max-w-[180px] truncate">
                      {tc.actualResult || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {tc.status === 'PASS' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASS</span>
                        </span>
                      ) : tc.status === 'FAIL' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center space-x-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          <span>FAIL</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 w-fit">
                          {tc.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {tc.executionTimeMs}ms
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {tc.status === 'FAIL' && (
                          <button
                            onClick={() => onNavigate('defects')}
                            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40 transition-colors"
                            title="Log Defect for Failure"
                          >
                            <Bug className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(tc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                          title="Edit Test Case"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTc(tc);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Test Case"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Add New Test Case</h3>
            <p className="text-xs text-slate-400 mb-4">Define a new white-box or black-box test scenario.</p>

            <form onSubmit={handleAddTestCase} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Test Case ID</label>
                  <input
                    type="text"
                    placeholder="e.g. TC-BVA-07"
                    value={formTcId}
                    onChange={(e) => setFormTcId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Testing Technique</label>
                  <select
                    value={formTechnique}
                    onChange={(e) => setFormTechnique(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    <option value="BOUNDARY_VALUE">Boundary Value Analysis</option>
                    <option value="EQUIVALENCE_PARTITIONING">Equivalence Partitioning</option>
                    <option value="DECISION_TABLE">Decision Table</option>
                    <option value="FUNCTIONAL">Functional Testing</option>
                    <option value="WHITE_BOX_BRANCH">White Box Branch</option>
                    <option value="BASIS_PATH">Basis Path Testing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boundary: Upper Limit for Adult (120)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Input Data *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 18 or -1"
                    value={formInputData}
                    onChange={(e) => setFormInputData(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Test Scope</label>
                  <select
                    value={formTestType}
                    onChange={(e) => setFormTestType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    <option value="BLACK_BOX">Black Box</option>
                    <option value="WHITE_BOX">White Box</option>
                    <option value="INTEGRATED">Integrated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Result *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eligible"
                  value={formExpected}
                  onChange={(e) => setFormExpected(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preconditions</label>
                <input
                  type="text"
                  placeholder="e.g. AgeValidator initialized"
                  value={formPreconditions}
                  onChange={(e) => setFormPreconditions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Test Steps</label>
                <textarea
                  rows={2}
                  placeholder="1. Call checkEligibility(age)..."
                  value={formSteps}
                  onChange={(e) => setFormSteps(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="addFailToggle"
                  checked={formIntentionalFailure}
                  onChange={(e) => setFormIntentionalFailure(e.target.checked)}
                  className="rounded border-amber-600 text-amber-500"
                />
                <label htmlFor="addFailToggle" className="text-xs text-amber-300 font-semibold cursor-pointer">
                  Label as Demonstration Failure (Intentional Mismatch)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-indigo-600/25"
                >
                  Add Test Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedTc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Edit Test Case: {selectedTc.testCaseId}</h3>
            <p className="text-xs text-slate-400 mb-4">Modify test case definition and expectations.</p>

            <form onSubmit={handleEditTestCase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Input Data *</label>
                  <input
                    type="text"
                    required
                    value={formInputData}
                    onChange={(e) => setFormInputData(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Testing Technique</label>
                  <select
                    value={formTechnique}
                    onChange={(e) => setFormTechnique(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    <option value="BOUNDARY_VALUE">Boundary Value Analysis</option>
                    <option value="EQUIVALENCE_PARTITIONING">Equivalence Partitioning</option>
                    <option value="DECISION_TABLE">Decision Table</option>
                    <option value="FUNCTIONAL">Functional Testing</option>
                    <option value="WHITE_BOX_BRANCH">White Box Branch</option>
                    <option value="BASIS_PATH">Basis Path Testing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Result *</label>
                <input
                  type="text"
                  required
                  value={formExpected}
                  onChange={(e) => setFormExpected(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Test Steps</label>
                <textarea
                  rows={2}
                  value={formSteps}
                  onChange={(e) => setFormSteps(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && selectedTc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Test Case?</h3>
            <p className="text-xs text-slate-400 mb-4">
              Are you sure you want to delete <span className="font-mono text-rose-400 font-bold">{selectedTc.testCaseId}</span> ({selectedTc.name})?
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTestCase}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg"
              >
                Delete Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
