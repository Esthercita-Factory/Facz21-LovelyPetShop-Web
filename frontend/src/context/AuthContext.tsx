import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { getToken, setToken, getStoredUser, setStoredUser, apiFetch } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isClient: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setTokenState] = useState<string | null>(getToken);

  useEffect(() => {
    const checkSession = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await apiFetch<User>('/auth/me');
          if (res) {
            setUser(res);
            setStoredUser(res);
          }
        } catch {
          setToken(null);
          setStoredUser(null);
          setTokenState(null);
          setUser(null);
        }
      }
    };
    checkSession();
  }, []);

  const handleAuthSuccess = (res: AuthResponse) => {
    setToken(res.token);
    setStoredUser(res.user);
    setTokenState(res.token);
    setUser(res.user);
  };

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email: usernameOrEmail, password })
    });
    handleAuthSuccess(res);
  };

  const register = async (data: any) => {
    const res = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    handleAuthSuccess(res);
  };

  const logout = () => {
    setToken(null);
    setStoredUser(null);
    setTokenState(null);
    setUser(null);
  };

  const showToast = (_message: string, _type?: 'success' | 'error' | 'info') => {
    // Redundant floating toasts disabled per user preference
  };

  const isStaff = !!user && ['Admin', 'Veterinario', 'Recepcion'].includes(user.role);
  const isClient = !!user && user.role === 'Cliente';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isStaff,
        isClient,
        login,
        register,
        logout,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
