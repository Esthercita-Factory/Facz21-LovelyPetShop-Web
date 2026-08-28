import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, ShoppingBag, LogIn, LogOut, LayoutDashboard, PawPrint } from 'lucide-react';
import { Button } from '../common/Button';
import { BrandLogoIcon } from '../common/PetIcons';

interface CustomerNavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAuth
}) => {
  const { user, isAuthenticated, isStaff, isClient, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStaffDefaultTab = () => {
    if (!user) return 'dashboard';
    if (user.role === 'Admin') return 'dashboard';
    if (user.role === 'Veterinario') return 'pets';
    return 'appointments';
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand with Custom Brand Logo */}
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
        >
          <BrandLogoIcon className="w-9 h-9 group-hover:scale-105 transition-transform duration-200" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Lovely<span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-pink-500">Pet</span>Shop
          </span>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-900/60 p-1 rounded-full border border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={() => onSelectTab('landing')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Inicio
          </button>
          
          <button
            onClick={() => onSelectTab('store')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'store'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Tienda Online
          </button>

          {isClient && (
            <button
              onClick={() => onSelectTab('my-pets')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'my-pets'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PawPrint className="w-3.5 h-3.5" /> Mis Mascotas
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Back to Staff panel shortcut */}
              {isStaff && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectTab(getStaffDefaultTab())}
                  icon={<LayoutDashboard className="w-3.5 h-3.5" />}
                  className="hidden sm:inline-flex"
                >
                  Panel Staff ({user.role})
                </Button>
              )}

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-full">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {getInitials(user.full_name || user.username)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate leading-tight">
                    {user.full_name || user.username}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                title="Cerrar sesión"
                className="!p-2 text-slate-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenAuth('login')}
              icon={<LogIn className="w-3.5 h-3.5" />}
            >
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
