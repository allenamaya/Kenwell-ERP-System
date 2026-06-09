'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { apiClient, login, logout, getCurrentUser } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'agent' | 'customer' | 'finance' | 'operations';
  customer_id?: number;
  customer_code?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasSeenSplash: boolean;
  setHasSeenSplash: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      let token: string | null = null;
      try {
        token = localStorage.getItem('access_token');
      } catch (e) {
        console.warn('localStorage read blocked in AuthProvider:', e);
      }
      
      if (token) {
        apiClient.setToken(token);
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser as any);
        } catch (error) {
          console.error('[v0] Failed to fetch current user:', error);
          apiClient.clearToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response: any = await login(username, password);
      apiClient.setToken(response.access);
      setUser(response.user);
    } catch (error) {
      console.error('[v0] Login failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    logout();
    setUser(null);
  };

  const handleRefresh = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser as any);
    } catch (error) {
      console.error('[v0] Failed to refresh user:', error);
      handleLogout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login: handleLogin,
        logout: handleLogout,
        refresh: handleRefresh,
        hasSeenSplash,
        setHasSeenSplash,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
