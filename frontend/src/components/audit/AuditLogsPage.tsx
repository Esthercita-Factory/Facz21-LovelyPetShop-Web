import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { apiFetch } from '../../services/api';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Activity, 
  Calendar, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('todos');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AuditLog[]>('/audit-logs');
      setLogs(data || []);
    } catch (e) {
      console.error('Error loading audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      l.description.toLowerCase().includes(term) ||
      l.user_name.toLowerCase().includes(term) ||
      l.module.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term);

    const matchesModule = moduleFilter === 'todos' || l.module.toLowerCase() === moduleFilter.toLowerCase();
    return matchesSearch && matchesModule;
  });

  const getActionBadge = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes('CREAR')) {
      return (
        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
          CREAR
        </span>
      );
    }
    if (a.includes('ACTUALIZAR') || a.includes('EDIT')) {
      return (
        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
          ACTUALIZAR
        </span>
      );
    }
    if (a.includes('ELIMINAR') || a.includes('BORRAR')) {
      return (
        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60">
          ELIMINAR
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {action}
      </span>
    );
  };

  const modules = [
    { id: 'todos', label: 'Todos los Módulos' },
    { id: 'personal', label: 'Personal' },
    { id: 'hospitalización', label: 'Hospitalización' },
    { id: 'pacientes', label: 'Pacientes' },
    { id: 'seguridad', label: 'Seguridad' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Auditoría & Trazabilidad
            </h2>
            <Badge variant="neutral" size="sm">
              Seguridad & Logs
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro cronológico de operaciones administrativas, cambios en inventario, admisiones y expedientes.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadLogs}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Actualizar Registros
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Buscar por usuario, acción o detalle..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          {modules.map(m => (
            <button
              key={m.id}
              onClick={() => setModuleFilter(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                moduleFilter === m.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No hay registros de auditoría</h4>
          <p className="text-xs text-slate-400 mt-1">No se encontraron eventos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Fecha y Hora</th>
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Acción</th>
                  <th className="py-3.5 px-4">Módulo</th>
                  <th className="py-3.5 px-4">Descripción de la Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(l => {
                  const d = new Date(l.timestamp);

                  return (
                    <tr key={l.uuid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {d.toLocaleDateString('es-CO')} {d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black">
                            {l.user_name.charAt(0).toUpperCase()}
                          </span>
                          <span>{l.user_name}</span>
                          <span className="text-[10px] text-slate-400">({l.user_role})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(l.action)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                        {l.module}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-md">
                        {l.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
