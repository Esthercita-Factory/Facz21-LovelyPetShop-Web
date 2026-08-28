import React, { useState, useEffect } from 'react';
import { VaccineAlert } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import { 
  Search, 
  Syringe, 
  Calendar, 
  Phone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { getSpeciesAvatarComponent } from '../common/PetIcons';

export const VaccinesPage: React.FC = () => {
  const { showToast } = useAuth();
  const [alerts, setAlerts] = useState<VaccineAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<VaccineAlert[]>('/medicalrecords/vaccine-alerts');
      setAlerts(data || []);
    } catch (e) {
      console.error('Error loading vaccine alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleWhatsAppContact = (alert: VaccineAlert) => {
    if (!alert.owner_phone) {
      showToast('El propietario no tiene número de teléfono registrado.', 'error');
      return;
    }
    const cleanPhone = alert.owner_phone.replace(/\D/g, '');
    const dateStr = alert.next_vaccine_date ? new Date(alert.next_vaccine_date).toLocaleDateString('es-CO') : 'próximamente';
    const message = encodeURIComponent(
      `Hola ${alert.owner_name}, te escribimos de LovelyPetShop Clínica Veterinaria para recordarte que la vacuna/control de tu consentido ${alert.pet_name} tiene fecha programada para el ${dateStr}. ¿Deseas agendar su cita?`
    );
    window.open(`https://wa.me/57${cleanPhone}?text=${message}`, '_blank');
  };

  const filteredAlerts = alerts.filter(a => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      a.pet_name.toLowerCase().includes(term) ||
      a.owner_name.toLowerCase().includes(term) ||
      a.species.toLowerCase().includes(term) ||
      (a.treatment && a.treatment.toLowerCase().includes(term));

    let matchesStatus = true;
    if (statusFilter === 'vencidas') {
      matchesStatus = a.days_remaining < 0;
    } else if (statusFilter === 'urgentes') {
      matchesStatus = a.days_remaining >= 0 && a.days_remaining <= 7;
    } else if (statusFilter === 'proximas') {
      matchesStatus = a.days_remaining > 7 && a.days_remaining <= 30;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, days: number) => {
    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60">
          <AlertTriangle className="w-3 h-3" /> Vencida hace {Math.abs(days)} d
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
          <Clock className="w-3 h-3" /> Urgente ({days} d)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
        <Calendar className="w-3 h-3" /> En {days} días
      </span>
    );
  };

  const overdueCount = alerts.filter(a => a.days_remaining < 0).length;
  const urgentCount = alerts.filter(a => a.days_remaining >= 0 && a.days_remaining <= 7).length;
  const upcomingCount = alerts.filter(a => a.days_remaining > 7 && a.days_remaining <= 30).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Control de Vacunas & Revacunaciones
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Seguimiento de esquemas biológicos, refuerzos pendientes y contacto directo con propietarios.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadAlerts}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Actualizar Lista
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'vencidas' ? 'todos' : 'vencidas')}
          className={`glass-card p-5 rounded-2xl cursor-pointer transition-all ${statusFilter === 'vencidas' ? 'ring-2 ring-rose-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Refuerzos Vencidos</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{overdueCount}</p>
          <span className="text-[11px] text-slate-400">Requieren contacto inmediato</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'urgentes' ? 'todos' : 'urgentes')}
          className={`glass-card p-5 rounded-2xl cursor-pointer transition-all ${statusFilter === 'urgentes' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Próximos (7 Días)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{urgentCount}</p>
          <span className="text-[11px] text-slate-400">Para agendar esta semana</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'proximas' ? 'todos' : 'proximas')}
          className={`glass-card p-5 rounded-2xl cursor-pointer transition-all ${statusFilter === 'proximas' ? 'ring-2 ring-indigo-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Próximos (30 Días)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{upcomingCount}</p>
          <span className="text-[11px] text-slate-400">Controles preventivos al día</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Buscar por paciente, propietario o vacuna..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'vencidas', label: 'Vencidas' },
            { id: 'urgentes', label: '7 Días' },
            { id: 'proximas', label: '30 Días' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-60 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Syringe className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No hay alertas de vacunación</h4>
          <p className="text-xs text-slate-400 mt-1">Todos los pacientes tienen sus esquemas al día o prueba con otros filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map(a => {
            const nextDate = a.next_vaccine_date ? new Date(a.next_vaccine_date) : null;
            const lastDate = a.last_vaccine_date ? new Date(a.last_vaccine_date) : null;

            return (
              <div
                key={a.record_uuid}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {getSpeciesAvatarComponent(a.species, 'w-11 h-11', a.pet_name)}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {a.pet_name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {a.species} • {a.breed || 'Sin raza'}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(a.status, a.days_remaining)}
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Tratamiento / Vacuna:</span>
                      <strong className="text-slate-800 dark:text-slate-200 max-w-[140px] truncate">
                        {a.treatment || a.diagnosis || 'Control Biológico'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Fecha de Refuerzo:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {nextDate ? nextDate.toLocaleDateString('es-CO') : 'Sin definir'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                      <span className="text-slate-400 font-medium">Propietario:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{a.owner_name}</span>
                    </div>

                    {a.owner_phone && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Teléfono:</span>
                        <span className="text-slate-600 dark:text-slate-300">{a.owner_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleWhatsAppContact(a)}
                    icon={<MessageSquare className="w-3.5 h-3.5" />}
                  >
                    Recordar por WhatsApp
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
