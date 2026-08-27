import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { LogIn, UserPlus, Sparkles, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const { login, register, quickLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Sync mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register extra states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      onClose();
      if (onSuccess) onSuccess();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        username,
        email,
        password,
        phone,
        address
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setLoading(true);
    try {
      await quickLogin(u, p);
      onClose();
      if (onSuccess) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Crear Cuenta
          </button>
        </div>
      }
      maxWidth={mode === 'register' ? 'lg' : 'md'}
    >
      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <Input
            label="Usuario o Correo Electrónico"
            placeholder="ej: admin o cliente@correo.com"
            value={usernameOrEmail}
            onChange={e => setUsernameOrEmail(e.target.value)}
            required
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={loading}
            icon={<LogIn className="w-4 h-4" />}
          >
            Ingresar al Sistema
          </Button>

          {/* Quick Demo Access */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Acceso Rápido por Rol (Demo)
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Admin123!')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/50 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <span>👑</span> Admin
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('vet', 'Vet123!')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-purple-500 bg-slate-50/70 hover:bg-purple-50/50 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <span>🩺</span> Veterinario
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('recepcion', 'Recepcion123!')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-cyan-500 bg-slate-50/70 hover:bg-cyan-50/50 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <span>🛎️</span> Recepción
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('cliente', 'Cliente123!')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/50 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <span>🐶</span> Cliente Demo
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej: María Gómez"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            icon={<User className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre de Usuario"
              placeholder="mariag"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="maria@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Teléfono / Celular"
              type="tel"
              placeholder="3001234567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Dirección"
              placeholder="Calle 10 # 20-30"
              value={address}
              onChange={e => setAddress(e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={loading}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Completar Registro
          </Button>
        </form>
      )}
    </Modal>
  );
};
