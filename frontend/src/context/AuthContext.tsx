import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthResponse } from '../types';
import { getToken, setToken, getStoredUser, setStoredUser, apiFetch } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isClient: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  quickLogin: (username: string, password: string) => Promise<void>;
  logout: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setTokenState] = useState<string | null>(getToken);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleAuthSuccess = (res: AuthResponse, welcomeMessage?: string) => {
    setToken(res.token);
    setStoredUser(res.user);
    setTokenState(res.token);
    setUser(res.user);
    showToast(welcomeMessage || `¡Bienvenido, ${res.user.full_name || res.user.username}!`);
  };

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const res = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username_or_email: usernameOrEmail, password })
      });
      handleAuthSuccess(res);
    } catch (err: any) {
      showToast(err.message || 'Error al iniciar sesión', 'error');
      throw err;
    }
  };

  const register = async (data: any) => {
    try {
      const res = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      handleAuthSuccess(res, '¡Cuenta creada con éxito! Bienvenido.');
    } catch (err: any) {
      showToast(err.message || 'Error al registrar usuario', 'error');
      throw err;
    }
  };

  const quickLogin = async (username: string, password: string) => {
    try {
      const res = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username_or_email: username, password })
      });
      handleAuthSuccess(res, `Acceso rápido exitoso como ${res.user.role} (${res.user.full_name})`);
    } catch (err: any) {
      showToast('Error en acceso demo.', 'error');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setStoredUser(null);
    setTokenState(null);
    setUser(null);
    showToast('Sesión cerrada correctamente.', 'info');
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
        quickLogin,
        logout,
        toast,
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
