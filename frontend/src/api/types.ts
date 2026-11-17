export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface Project {
  id: number;
  name: string;
  description: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceFile {
  id: number;
  fileName: string;
  filePath: string;
  content: string;
  packagePath: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCase {
  id: number;
  testCaseId: string;
  name: string;
  technique: string;
  preconditions: string;
  inputData: string;
  steps: string;
  expectedResult: string;
  actualResult?: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'ERROR' | 'NOT_RUN';
  executionTimeMs: number;
  testType: 'WHITE_BOX' | 'BLACK_BOX' | 'INTEGRATED';
  isIntentionalFailure?: boolean;
  createdAt?: string;
}

export interface TestExecution {
  id: number;
  executionNumber: string;
  testType: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorCount: number;
  durationMs: number;
  statementCoverage: number;
  branchCoverage: number;
  cyclomaticComplexity: number;
  status: string;
  executedAt: string;
}

export interface IndividualResult {
  testCaseDbId: number;
  testCaseId: string;
  testName: string;
  technique: string;
  inputData: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  executionTimeMs: number;
  errorMessage?: string;
  intentionalFailure?: boolean;
}

export interface ExecutionSummary {
  executionId: number;
  executionNumber: string;
  projectName: string;
  projectId: number;
  testType: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorCount: number;
  durationMs: number;
  statementCoverage: number;
  branchCoverage: number;
  cyclomaticComplexity: number;
  executedAt: string;
  results: IndividualResult[];
  uncoveredLines: number[];
  uncoveredBranches: string[];
  recommendations: string[];
}

export interface Defect {
  id: number;
  defectCode: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  testCase?: TestCase;
  createdAt: string;
  updatedAt: string;
}

export interface CfgNode {
  id: string;
  label: string;
  type: 'ENTRY' | 'EXIT' | 'DECISION' | 'STATEMENT' | 'MERGE' | 'LOOP';
  lineNumber: number;
  codeSnippet: string;
}

export interface CfgEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  style?: string;
}

export interface CyclomaticMetric {
  edges: number;
  nodes: number;
  connectedComponents: number;
  complexity: number;
  formula: string;
  interpretation: string;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
}

export interface IndependentPath {
  pathNumber: number;
  description: string;
  nodeIds: string[];
  conditionsExercised: string[];
}

export interface WhiteBoxAnalysisResult {
  syntaxValid: boolean;
  compilationErrors: string[];
  totalLines: number;
  totalStatements: number;
  totalBranches: number;
  totalDecisions: number;
  methods: Array<{
    name: string;
    returnType: string;
    parameters: string[];
    startLine: number;
    endLine: number;
    cyclomaticComplexity: number;
    decisionPoints: number;
    loopPoints: number;
  }>;
  cfgNodes: CfgNode[];
  cfgEdges: CfgEdge[];
  cyclomaticMetric: CyclomaticMetric;
  independentPaths: IndependentPath[];
}

export interface DashboardStats {
  totalProjects: number;
  totalTestRuns: number;
  totalTestCases: number;
  totalPassedTests: number;
  totalFailedTests: number;
  passRate: number;
  avgStatementCoverage: number;
  avgBranchCoverage: number;
  openDefects: number;
  totalDefects: number;
  latestExecutions: TestExecution[];
  blackBoxDistribution: Record<string, number>;
  projectStats: Array<{
    id: number;
    name: string;
    language: string;
    testCount: number;
    runCount: number;
    defectCount: number;
    statementCoverage: number;
  }>;
  recentActivity: Array<{
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    details: string;
    timestamp: string;
  }>;
}

export interface ExecutionComparison {
  runA: ExecutionSummary;
  runB: ExecutionSummary;
  deltaPassed: number;
  deltaFailed: number;
  deltaStatementCoverage: number;
  deltaBranchCoverage: number;
  statusChanges: Array<{
    testCaseId: string;
    testName: string;
    previousStatus: string;
    newStatus: string;
  }>;
}
