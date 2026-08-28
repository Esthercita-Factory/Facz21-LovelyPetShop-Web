import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  PawPrint, 
  UserPlus, 
  Calendar, 
  UserCheck, 
  Boxes, 
  Store, 
  LogOut,
  Syringe,
  BedDouble,
  ShieldCheck
} from 'lucide-react';
import { BrandLogoIcon } from '../common/PetIcons';

interface StaffSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'Staff';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Métricas', icon: LayoutDashboard, roles: ['Admin'] },
    { id: 'pets', label: 'Pacientes & Fichas', icon: PawPrint, roles: ['Admin', 'Veterinario', 'Recepcion'] },
    { id: 'vaccines', label: 'Control de Vacunación', icon: Syringe, roles: ['Admin', 'Veterinario', 'Recepcion'] },
    { id: 'hospitalization', label: 'Hospitalización & Caniles', icon: BedDouble, roles: ['Admin', 'Veterinario'] },
    { id: 'appointments', label: 'Agenda de Citas', icon: Calendar, roles: ['Admin', 'Veterinario', 'Recepcion'] },
    { id: 'owners', label: 'Directorio Propietarios', icon: Users, roles: ['Admin', 'Recepcion'] },
    { id: 'combined-reg', label: 'Registro Conjunto (1 Paso)', icon: UserPlus, roles: ['Admin', 'Recepcion'] },
    { id: 'employees', label: 'Equipo & Turnos', icon: UserCheck, roles: ['Admin'] },
    { id: 'products', label: 'Inventario & Fármacos', icon: Boxes, roles: ['Admin', 'Veterinario'] },
    { id: 'audit-logs', label: 'Auditoría & Trazabilidad', icon: ShieldCheck, roles: ['Admin'] },
    { id: 'store', label: 'Tienda Virtual (Vista)', icon: Store, roles: ['Admin', 'Veterinario', 'Recepcion'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'Admin': return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20';
      case 'Veterinario': return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20';
      case 'Recepcion': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    }
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col justify-between glass-panel border-r border-slate-200/80 dark:border-slate-800/80 p-4 transition-colors">
      <div className="space-y-5 overflow-y-auto pr-1">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <BrandLogoIcon className="w-9 h-9 shrink-0" />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Lovely<span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-pink-500">Pet</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Panel Administrativo
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-pink-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'ST'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.full_name || user?.username}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                @{user?.username}
              </span>
            </div>
          </div>

          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border text-center ${getRoleBadgeClass()}`}>
            {role}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1 shrink-0">
        <button
          onClick={() => onSelectTab('landing')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Store className="w-4 h-4 text-slate-400" />
          <span>Ir a Portal Público</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
