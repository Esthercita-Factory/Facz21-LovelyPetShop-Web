import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { LogIn, UserPlus, User, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
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
    setErrorMessage(null);
    try {
      await login(usernameOrEmail, password);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Por favor ingrese una dirección de correo electrónico válida (ej: nombre@dominio.com).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await register({
        full_name: fullName.trim(),
        username: username.trim(),
        email: cleanEmail,
        password,
        phone: phone.trim(),
        address: address.trim()
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al completar el registro.');
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
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
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
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
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
      {/* Error Alert Box inside Modal */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 animate-fade-in-scale">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <Input
            label="Usuario o Correo Electrónico"
            placeholder="ej: usuario@correo.com"
            value={usernameOrEmail}
            onChange={e => {
              setUsernameOrEmail(e.target.value);
              setErrorMessage(null);
            }}
            required
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setErrorMessage(null);
            }}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-3"
            loading={loading}
            icon={<LogIn className="w-4 h-4" />}
          >
            Ingresar al Sistema
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej: María Gómez"
            value={fullName}
            onChange={e => {
              setFullName(e.target.value);
              setErrorMessage(null);
            }}
            required
            icon={<User className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre de Usuario"
              placeholder="mariag"
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setErrorMessage(null);
              }}
              required
            />
            <Input
              label="Correo Electrónico (Válido)"
              type="email"
              placeholder="maria@ejemplo.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setErrorMessage(null);
              }}
              required
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setErrorMessage(null);
            }}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Teléfono / Celular"
              type="tel"
              placeholder="3001234567"
              value={phone}
              onChange={e => {
                setPhone(e.target.value);
                setErrorMessage(null);
              }}
              icon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Dirección"
              placeholder="Calle 10 # 20-30"
              value={address}
              onChange={e => {
                setAddress(e.target.value);
                setErrorMessage(null);
              }}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-3"
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
