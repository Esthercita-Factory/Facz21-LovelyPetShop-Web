import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  PawPrint, 
  Users, 
  CalendarDays, 
  Stethoscope, 
  Boxes, 
  PlusCircle, 
  Globe, 
  LogOut, 
  Heart,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface StaffSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'Admin';

  const getRoleBadgeVariant = (r: string) => {
    switch (r) {
      case 'Admin': return 'danger';
      case 'Veterinario': return 'purple';
      case 'Recepcion': return 'info';
      default: return 'primary';
    }
  };

  const getRoleDisplayName = (r: string) => {
    switch (r) {
      case 'Admin': return 'Administrador';
      case 'Veterinario': return 'Médico Veterinario';
      case 'Recepcion': return 'Recepción & Caja';
      default: return r;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    { id: 'pets', label: 'Pacientes', icon: PawPrint, roles: ['Admin', 'Veterinario', 'Recepcion'] },
    { id: 'owners', label: 'Propietarios', icon: Users, roles: ['Admin', 'Recepcion'] },
    { id: 'appointments', label: 'Citas', icon: CalendarDays, roles: ['Admin', 'Veterinario', 'Recepcion'] },
    { id: 'products', label: 'Inventario & Insumos', icon: Boxes, roles: ['Admin', 'Veterinario', 'Recepcion'] },
    { id: 'employees', label: 'Personal', icon: Stethoscope, roles: ['Admin'] },
    { id: 'combined', label: 'Registro Rápido', icon: PlusCircle, roles: ['Admin', 'Recepcion'], isAccent: true },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 z-30 transition-colors">
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Heart className="w-5 h-5 fill-indigo-600 dark:fill-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Lovely<span className="text-indigo-600 dark:text-indigo-400">Pet</span>
            </h1>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Panel Staff
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isAccent) {
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`mt-2 flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isActive
                      ? 'bg-indigo-700 text-white shadow-indigo-600/30 shadow-md ring-2 ring-indigo-400/40'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}

          {/* Switch to public web */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onSelectTab('landing')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'landing' || activeTab === 'store'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 text-slate-400" />
              Ver Web / Tienda
            </button>
          </div>
        </nav>
      </div>

      {/* Staff Profile & Logout */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {getInitials(user?.full_name || user?.username)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.full_name || user?.username || 'Personal'}
              </p>
              <Badge variant={getRoleBadgeVariant(role) as any} size="sm" className="mt-0.5 text-[10px]">
                {getRoleDisplayName(role)}
              </Badge>
            </div>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
