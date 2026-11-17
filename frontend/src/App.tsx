import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RunTestsModal } from './components/RunTestsModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { CodeEditorPage } from './pages/CodeEditorPage';
import { WhiteBoxPage } from './pages/WhiteBoxPage';
import { CfgViewerPage } from './pages/CfgViewerPage';
import { BlackBoxPage } from './pages/BlackBoxPage';
import { TestCaseManagementPage } from './pages/TestCaseManagementPage';
import { ExecutionResultsPage } from './pages/ExecutionResultsPage';
import { DefectManagementPage } from './pages/DefectManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { TestHistoryPage } from './pages/TestHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

import { ExecutionSummary } from './api/types';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // Navigation view sync with window.location.hash
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  const [runModalOpen, setRunModalOpen] = useState(false);
  const [latestSummary, setLatestSummary] = useState<ExecutionSummary | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecutionComplete = (summary: ExecutionSummary) => {
    setLatestSummary(summary);
    navigateTo('execution-results');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <div className="text-sm font-semibold text-slate-300 tracking-wide">
          Initializing TestFusion Platform...
        </div>
      </div>
    );
  }

  // Unauthenticated view
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('register')} />;
  }

  // Render current view component
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={navigateTo}
            onOpenRunModal={() => setRunModalOpen(true)}
          />
        );
      case 'projects':
        return <ProjectsPage onNavigate={navigateTo} />;
      case 'project-details':
        return (
          <ProjectDetailsPage
            onNavigate={navigateTo}
            onOpenRunModal={() => setRunModalOpen(true)}
          />
        );
      case 'code-editor':
        return <CodeEditorPage onNavigate={navigateTo} />;
      case 'white-box':
        return (
          <WhiteBoxPage
            onNavigate={navigateTo}
            onOpenRunModal={() => setRunModalOpen(true)}
          />
        );
      case 'cfg':
        return <CfgViewerPage onNavigate={navigateTo} />;
      case 'black-box':
        return <BlackBoxPage onNavigate={navigateTo} />;
      case 'test-cases':
        return (
          <TestCaseManagementPage
            onNavigate={navigateTo}
            onOpenRunModal={() => setRunModalOpen(true)}
          />
        );
      case 'execution-results':
        return (
          <ExecutionResultsPage
            onNavigate={navigateTo}
            onOpenRunModal={() => setRunModalOpen(true)}
            latestSummary={latestSummary}
          />
        );
      case 'defects':
        return <DefectManagementPage />;
      case 'reports':
        return <ReportsPage />;
      case 'history':
        return <TestHistoryPage onNavigate={navigateTo} />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPage />;
      default:
        return (
          <DashboardPage
            onNavigate={navigateTo}
            onOpenRunModal={() => setRunModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onNavigate={navigateTo} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentView={currentView}
          onNavigate={navigateTo}
          onOpenRunModal={() => setRunModalOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </main>
      </div>

      {/* Global Run Tests Modal */}
      <RunTestsModal
        isOpen={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        onExecutionComplete={handleExecutionComplete}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
