import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Project } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  ExternalLink, 
  Search, 
  AlertCircle,
  FileCode,
  Calendar,
  X
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (view: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const { selectedProject, setSelectedProject, refreshProjects } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLanguage, setFormLanguage] = useState('Java');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    try {
      const newProj = await api.createProject({
        name: formName,
        description: formDescription,
        language: formLanguage,
      });
      setIsCreateOpen(false);
      setFormName('');
      setFormDescription('');
      await refreshProjects();
      await fetchProjects();
      setSelectedProject(newProj);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit || !formName.trim()) return;
    try {
      const updated = await api.updateProject(projectToEdit.id, {
        name: formName,
        description: formDescription,
        language: formLanguage,
      });
      setIsEditOpen(false);
      setProjectToEdit(null);
      await refreshProjects();
      await fetchProjects();
      if (selectedProject?.id === updated.id) {
        setSelectedProject(updated);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.deleteProject(projectToDelete.id);
      setIsDeleteOpen(false);
      setProjectToDelete(null);
      await refreshProjects();
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const openEditModal = (p: Project) => {
    setProjectToEdit(p);
    setFormName(p.name);
    setFormDescription(p.description || '');
    setFormLanguage(p.language || 'Java');
    setIsEditOpen(true);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <FolderGit2 className="w-6 h-6 text-indigo-400" />
            <span>Testing Projects</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage target source code repositories, test configurations, and test suites.
          </p>
        </div>

        <button
          onClick={() => {
            setFormName('');
            setFormDescription('');
            setFormLanguage('Java');
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search projects by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl max-w-lg mx-auto">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm ? 'No projects match your search query.' : 'Create your first project to start running white and black box tests.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const isSelected = selectedProject?.id === p.id;
            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all flex flex-col justify-between shadow-xl relative ${
                  isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/40 bg-indigo-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{p.name}</h3>
                        <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          {p.language} 17
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(p.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {!isSelected && (
                      <button
                        onClick={() => setSelectedProject(p)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedProject(p);
                        onNavigate('project-details');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="View Project Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                      title="Edit Project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setProjectToDelete(p);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Create Testing Project</h3>
            <p className="text-xs text-slate-400 mb-4">Set up a new workspace for testing source files.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order Processing Engine"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the application logic or business rules..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Programming Language</label>
                <select
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Java">Java (JDK 17/25 Runner)</option>
                  <option value="Python" disabled>Python (Coming Soon)</option>
                  <option value="TypeScript" disabled>TypeScript (Coming Soon)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Java is fully supported with AST CFG generation and isolated JVM runner.</p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-600/25"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Edit Project</h3>
            <p className="text-xs text-slate-400 mb-4">Modify project name and details.</p>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to delete <span className="text-rose-400 font-semibold">{projectToDelete.name}</span>? This will permanently delete all associated source files, test cases, execution runs, and defect records.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-lg"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
