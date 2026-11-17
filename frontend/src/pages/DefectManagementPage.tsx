import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Defect } from '../api/types';
import { 
  Bug, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  FileDown, 
  X, 
  Clock, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const DefectManagementPage: React.FC = () => {
  const { selectedProject } = useAuth();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);

  // Form
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSteps, setFormSteps] = useState('');
  const [formExpected, setFormExpected] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formSeverity, setFormSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [formStatus, setFormStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('OPEN');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadDefects = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const data = await api.getProjectDefects(selectedProject.id);
      setDefects(data);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to load defects' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefects();
  }, [selectedProject]);

  const handleCreateDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !formTitle.trim()) return;
    try {
      const def = await api.createDefect(selectedProject.id, {
        title: formTitle,
        description: formDescription,
        stepsToReproduce: formSteps,
        expectedResult: formExpected,
        actualResult: formActual,
        severity: formSeverity,
        status: formStatus,
      });
      setIsAddOpen(false);
      resetForm();
      setNotification({ type: 'success', message: `Logged defect ${def.defectCode}: ${def.title}` });
      await loadDefects();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to create defect' });
    }
  };

  const handleUpdateDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDefect) return;
    try {
      await api.updateDefect(selectedDefect.id, {
        title: formTitle,
        description: formDescription,
        stepsToReproduce: formSteps,
        expectedResult: formExpected,
        actualResult: formActual,
        severity: formSeverity,
        status: formStatus,
      });
      setIsEditOpen(false);
      setSelectedDefect(null);
      resetForm();
      setNotification({ type: 'success', message: 'Defect status updated successfully' });
      await loadDefects();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update defect' });
    }
  };

  const handleDeleteDefect = async () => {
    if (!selectedDefect) return;
    try {
      await api.deleteDefect(selectedDefect.id);
      setIsDeleteOpen(false);
      setSelectedDefect(null);
      setNotification({ type: 'success', message: 'Defect record deleted' });
      await loadDefects();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete defect' });
    }
  };

  const openEditModal = (d: Defect) => {
    setSelectedDefect(d);
    setFormTitle(d.title);
    setFormDescription(d.description || '');
    setFormSteps(d.stepsToReproduce || '');
    setFormExpected(d.expectedResult || '');
    setFormActual(d.actualResult || '');
    setFormSeverity(d.severity);
    setFormStatus(d.status);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormSteps('');
    setFormExpected('');
    setFormActual('');
    setFormSeverity('MEDIUM');
    setFormStatus('OPEN');
  };

  const handleExportCsv = () => {
    if (!selectedProject) return;
    api.downloadCsv(api.getProjectDefectsCsvUrl(selectedProject.id), `defects_project_${selectedProject.id}.csv`);
  };

  const filtered = defects.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.defectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
    const matchesSeverity = filterSeverity === 'ALL' || d.severity === filterSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  if (!selectedProject) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Please select a project to view defect tracking.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Defect Tracking & Triage
            </span>
            <span className="text-xs text-slate-400">• {defects.length} Logged</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Bug & Defect Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Distinguish between test failures, execution errors, and verified software bugs.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadDefects}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Refresh Defect List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Defect</span>
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
            placeholder="Search defects by code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Defects Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Defect ID</th>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Linked Test Case</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    Loading defects...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    No defects recorded for the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-amber-400">
                      {d.defectCode}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{d.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{d.description}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-indigo-300">
                      {d.testCase ? d.testCase.testCaseId : 'Manual Entry'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : d.severity === 'HIGH'
                          ? 'bg-orange-950 text-orange-300 border border-orange-800'
                          : d.severity === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {d.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'OPEN'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : d.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : d.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(d)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                          title="Update Status / Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDefect(d);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Defect"
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

      {/* Add Defect Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Log New Defect</h3>
            <p className="text-xs text-slate-400 mb-4">Record a verified bug or regression issue.</p>

            <form onSubmit={handleCreateDefect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Defect Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boundary Condition Assertion Failure at Age 17"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detail what unexpected behavior occurred..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Result</label>
                  <input
                    type="text"
                    value={formExpected}
                    onChange={(e) => setFormExpected(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Result</label>
                  <input
                    type="text"
                    value={formActual}
                    onChange={(e) => setFormActual(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Steps to Reproduce</label>
                <textarea
                  rows={2}
                  placeholder="1. Call checkEligibility with... 2. Assert output..."
                  value={formSteps}
                  onChange={(e) => setFormSteps(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
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
                  Create Defect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Defect Modal */}
      {isEditOpen && selectedDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Update Defect: {selectedDefect.defectCode}</h3>
            <p className="text-xs text-slate-400 mb-4">Update status, severity, or triage notes.</p>

            <form onSubmit={handleUpdateDefect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold"
                >
                  <option value="OPEN">Open (Newly Logged)</option>
                  <option value="IN_PROGRESS">In Progress (Under Investigation)</option>
                  <option value="RESOLVED">Resolved (Fix Implemented)</option>
                  <option value="CLOSED">Closed (Verified & Done)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
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
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && selectedDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Defect Record?</h3>
            <p className="text-xs text-slate-400 mb-4">
              Delete defect <span className="font-mono text-rose-400 font-bold">{selectedDefect.defectCode}</span>?
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDefect}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
