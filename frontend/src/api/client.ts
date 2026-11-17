import {
  AuthResponse,
  DashboardStats,
  Defect,
  ExecutionComparison,
  ExecutionSummary,
  Project,
  SourceFile,
  TestCase,
  User,
  WhiteBoxAnalysisResult,
} from './types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('tf_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = 'Request failed';
    try {
      const err = await res.json();
      errMsg = err.message || err.error || errMsg;
    } catch {
      errMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async register(data: { username: string; email: string; password: string; fullName: string; role?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<User>(res);
  },

  async updateProfile(data: { fullName?: string; email?: string; password?: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Project[]>(res);
  },

  async getProject(id: number): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Project>(res);
  },

  async createProject(project: { name: string; description: string; language: string }): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(project),
    });
    return handleResponse<Project>(res);
  },

  async updateProject(id: number, project: { name: string; description: string; language: string }): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(project),
    });
    return handleResponse<Project>(res);
  },

  async deleteProject(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  async getSourceFiles(projectId: number): Promise<SourceFile[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/files`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<SourceFile[]>(res);
  },

  async updateSourceFile(projectId: number, fileId: number, content: string): Promise<SourceFile> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/files/${fileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ content }),
    });
    return handleResponse<SourceFile>(res);
  },

  // White Box
  async analyzeSource(code: string): Promise<WhiteBoxAnalysisResult> {
    const res = await fetch(`${API_BASE}/white-box/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ code }),
    });
    return handleResponse<WhiteBoxAnalysisResult>(res);
  },

  async analyzeProject(projectId: number): Promise<WhiteBoxAnalysisResult> {
    const res = await fetch(`${API_BASE}/white-box/projects/${projectId}/analysis`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<WhiteBoxAnalysisResult>(res);
  },

  async getProjectCoverage(projectId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/white-box/projects/${projectId}/coverage`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  // Black Box
  async getProjectTests(projectId: number, testType?: string): Promise<TestCase[]> {
    const url = testType ? `${API_BASE}/black-box/projects/${projectId}/tests?testType=${testType}` : `${API_BASE}/black-box/projects/${projectId}/tests`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<TestCase[]>(res);
  },

  async generateTests(projectId: number, request: any, save = true): Promise<TestCase[]> {
    const res = await fetch(`${API_BASE}/black-box/projects/${projectId}/generate?save=${save}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(request),
    });
    return handleResponse<TestCase[]>(res);
  },

  async createTestCase(projectId: number, testCase: Partial<TestCase>): Promise<TestCase> {
    const res = await fetch(`${API_BASE}/black-box/projects/${projectId}/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(testCase),
    });
    return handleResponse<TestCase>(res);
  },

  async updateTestCase(testId: number, testCase: Partial<TestCase>): Promise<TestCase> {
    const res = await fetch(`${API_BASE}/black-box/tests/${testId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(testCase),
    });
    return handleResponse<TestCase>(res);
  },

  async deleteTestCase(testId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/black-box/tests/${testId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  // Execution
  async runTests(projectId: number, request?: { testType?: string; testCaseIds?: number[]; customSourceCode?: string }): Promise<ExecutionSummary> {
    const res = await fetch(`${API_BASE}/executions/projects/${projectId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(request || {}),
    });
    return handleResponse<ExecutionSummary>(res);
  },

  async getExecution(executionId: number): Promise<ExecutionSummary> {
    const res = await fetch(`${API_BASE}/executions/${executionId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<ExecutionSummary>(res);
  },

  async compareExecutions(runAId: number, runBId: number): Promise<ExecutionComparison> {
    const res = await fetch(`${API_BASE}/executions/compare?runAId=${runAId}&runBId=${runBId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<ExecutionComparison>(res);
  },

  // Defects
  async getProjectDefects(projectId: number): Promise<Defect[]> {
    const res = await fetch(`${API_BASE}/defects/projects/${projectId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Defect[]>(res);
  },

  async getAllDefects(): Promise<Defect[]> {
    const res = await fetch(`${API_BASE}/defects`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Defect[]>(res);
  },

  async createDefect(projectId: number, defect: Partial<Defect>, testCaseId?: number): Promise<Defect> {
    const url = testCaseId ? `${API_BASE}/defects/projects/${projectId}?testCaseId=${testCaseId}` : `${API_BASE}/defects/projects/${projectId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(defect),
    });
    return handleResponse<Defect>(res);
  },

  async updateDefect(defectId: number, defect: Partial<Defect>): Promise<Defect> {
    const res = await fetch(`${API_BASE}/defects/${defectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(defect),
    });
    return handleResponse<Defect>(res);
  },

  async deleteDefect(defectId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/defects/${defectId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  // Reports
  async getProjectReportSummary(projectId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/projects/${projectId}/summary`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  getExecutionCsvUrl(executionId: number): string {
    return `${API_BASE}/reports/executions/${executionId}/csv`;
  },

  getProjectDefectsCsvUrl(projectId: number): string {
    return `${API_BASE}/reports/projects/${projectId}/defects/csv`;
  },

  async downloadCsv(url: string, filename: string): Promise<void> {
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to download CSV');
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  },

  // History
  async getProjectHistory(projectId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE}/history/projects/${projectId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  async getAllHistory(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DashboardStats>(res);
  },

  // Admin
  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<User[]>(res);
  },

  async updateAdminUserRole(userId: number, role: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ role }),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getAdminHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/system-health`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },
};
