import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, User } from '../api/types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  selectedProject: Project | null;
  projects: Project[];
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setSelectedProject: (p: Project | null) => void;
  refreshProjects: () => Promise<void>;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('tf_token'));
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('tf_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    const cached = localStorage.getItem('tf_selected_project');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const u = await api.getCurrentUser();
          setUser(u);
          localStorage.setItem('tf_user', JSON.stringify(u));
          await refreshProjects();
        } catch {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const refreshProjects = async () => {
    try {
      const plist = await api.getProjects();
      setProjects(plist);
      if (plist.length > 0) {
        if (!selectedProject || !plist.some((p) => p.id === selectedProject.id)) {
          setSelectedProject(plist[0]);
          localStorage.setItem('tf_selected_project', JSON.stringify(plist[0]));
        }
      } else {
        setSelectedProject(null);
        localStorage.removeItem('tf_selected_project');
      }
    } catch (e) {
      console.error('Failed to load projects', e);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('tf_token', newToken);
    localStorage.setItem('tf_user', JSON.stringify(newUser));
    refreshProjects();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSelectedProject(null);
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    localStorage.removeItem('tf_selected_project');
  };

  const handleSetSelectedProject = (p: Project | null) => {
    setSelectedProject(p);
    if (p) {
      localStorage.setItem('tf_selected_project', JSON.stringify(p));
    } else {
      localStorage.removeItem('tf_selected_project');
    }
  };

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem('tf_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        selectedProject,
        projects,
        loading,
        login,
        logout,
        setSelectedProject: handleSetSelectedProject,
        refreshProjects,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
