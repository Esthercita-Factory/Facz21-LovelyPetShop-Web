import React, { useState, useEffect } from 'react';
import { Appointment, Pet } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Plus, Calendar, Clock, PawPrint, Edit3, Trash2, CalendarDays, AlertCircle } from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const { showToast } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [petUuid, setPetUuid] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [serviceType, setServiceType] = useState('Consulta General');
  const [status, setStatus] = useState('Programada');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const getCurrentMinDateTime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [appData, petsData] = await Promise.all([
        apiFetch<Appointment[]>('/appointments'),
        apiFetch<Pet[]>('/pets')
      ]);
      setAppointments(appData || []);
      setPets(petsData || []);
    } catch (e) {
      console.error('Error loading appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPetName = (pUuid?: string) => {
    if (!pUuid) return 'Mascota Desconocida';
    const found = pets.find(p => p.uuid === pUuid);
    return found ? `${found.name} (${found.species})` : 'Mascota';
  };

  const getOwnerForPet = (pUuid?: string) => {
    const found = pets.find(p => p.uuid === pUuid);
    return found ? (found.ownerUuid || found.owner_uuid || found.ownerDocumentNumber || '') : '';
  };

  const validateAppointmentSlot = (dateStr: string): string | null => {
    if (!dateStr) return 'Por favor seleccione una fecha y hora.';
    const selected = new Date(dateStr);
    const now = new Date();

    if (!editingUuid && selected < now) {
      return 'No es posible programar citas en fechas u horas pasadas.';
    }

    const hour = selected.getHours();
    const dayOfWeek = selected.getDay(); // 0 = Sunday

    if (dayOfWeek === 0) {
      if (hour < 8 || hour >= 14) {
        return 'Los domingos la clínica atiende únicamente de 8:00 AM a 2:00 PM.';
      }
    } else {
      if (hour < 8 || hour >= 19) {
        return 'El horario de atención es de 8:00 AM a 7:00 PM (Lunes a Sábado).';
      }
    }

    return null;
  };

  const handleOpenCreate = () => {
    setEditingUuid(null);
    setPetUuid(pets[0]?.uuid || '');
    setFormError(null);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(9, 0, 0, 0);
    const tzOffset = nextDate.getTimezoneOffset() * 60000;
    setScheduledDate(new Date(nextDate.getTime() - tzOffset).toISOString().slice(0, 16));
    setServiceType('Consulta General');
    setStatus('Programada');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Appointment) => {
    setEditingUuid(a.uuid);
    setPetUuid(a.pet_uuid || a.petUuid || '');
    setFormError(null);
    const rawDate = a.scheduled_date || a.scheduledDate || new Date();
    const dt = new Date(rawDate);
    const tzOffset = dt.getTimezoneOffset() * 60000;
    setScheduledDate(new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16));
    setServiceType(a.service_type || a.serviceType || 'Consulta General');
    setStatus(a.status || 'Programada');
    setNotes(a.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm('¿Está seguro de eliminar o cancelar esta cita?')) return;
    try {
      await apiFetch(`/appointments/${uuid}`, { method: 'DELETE' });
      showToast('Cita eliminada con éxito.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar cita', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateAppointmentSlot(scheduledDate);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const body = {
        pet_uuid: petUuid,
        owner_uuid: getOwnerForPet(petUuid),
        scheduled_date: new Date(scheduledDate).toISOString(),
        service_type: serviceType,
        status: status,
        notes: notes
      };

      if (editingUuid) {
        await apiFetch(`/appointments/${editingUuid}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        showToast('¡Cita actualizada exitosamente!');
      } else {
        await apiFetch('/appointments', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showToast('¡Cita agendada con éxito!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar cita');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const rawDate = a.scheduled_date || a.scheduledDate;
    let matchDate = true;
    if (dateFilter && rawDate) {
      const appDate = new Date(rawDate).toISOString().split('T')[0];
      matchDate = (appDate === dateFilter);
    }
    const currentStatus = a.status || 'Programada';
    const matchStatus = !statusFilter || currentStatus === statusFilter;
    return matchDate && matchStatus;
  });

  const getStatusBadgeVariant = (st: string) => {
    switch (st) {
      case 'Programada': return 'primary';
      case 'Completada': return 'success';
      case 'Cancelada': return 'danger';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de Citas
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Agenda médica, consultas programadas y controles de vacunación.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Agendar Cita
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <Input
          label="Filtrar por Fecha"
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />

        <Select
          label="Filtrar por Estado"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Todos los Estados' },
            { value: 'Programada', label: 'Programada' },
            { value: 'Completada', label: 'Completada' },
            { value: 'Cancelada', label: 'Cancelada' }
          ]}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-60 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <CalendarDays className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No se encontraron citas</h4>
          <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros de fecha o estado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map(a => {
            const rawDate = a.scheduled_date || a.scheduledDate || new Date();
            const appDate = new Date(rawDate);
            const pUuid = a.pet_uuid || a.petUuid;
            const currentStatus = a.status || 'Programada';

            return (
              <div
                key={a.uuid}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {a.service_type || a.serviceType || 'Consulta'}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {appDate.toLocaleDateString('es-CO')} a las {appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <Badge variant={getStatusBadgeVariant(currentStatus) as any} size="sm">
                      {currentStatus}
                    </Badge>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <PawPrint className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <strong className="text-slate-900 dark:text-slate-100">{getPetName(pUuid)}</strong>
                    </div>
                  </div>

                  {a.notes && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/60 dark:border-slate-800/60 text-xs">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        Notas
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{a.notes}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(a)}
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(a.uuid)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Form Cita */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUuid ? 'Editar Cita' : 'Agendar Nueva Cita'}
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <Select
              label="Paciente (Mascota)"
              value={petUuid}
              onChange={e => setPetUuid(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Mascota --</option>
              {pets.map(p => (
                <option key={p.uuid} value={p.uuid}>
                  {p.name} ({p.species} - {p.breed || 'Sin raza'})
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Fecha y Hora"
                  type="datetime-local"
                  min={getCurrentMinDateTime()}
                  value={scheduledDate}
                  onChange={e => {
                    setScheduledDate(e.target.value);
                    setFormError(null);
                  }}
                  required
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Lun-Sáb: 8am-7pm | Dom: 8am-2pm
                </p>
              </div>

              <Select
                label="Servicio"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                required
                options={[
                  { value: 'Consulta General', label: 'Consulta General' },
                  { value: 'Vacunación', label: 'Vacunación' },
                  { value: 'Peluquería & Spa', label: 'Peluquería & Spa' },
                  { value: 'Cirugía', label: 'Cirugía' },
                  { value: 'Control Preventivo', label: 'Control Preventivo' }
                ]}
              />
            </div>

            <Select
              label="Estado de la Cita"
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
              options={[
                { value: 'Programada', label: 'Programada' },
                { value: 'Completada', label: 'Completada' },
                { value: 'Cancelada', label: 'Cancelada' }
              ]}
            />

            <Textarea
              label="Notas / Observaciones"
              placeholder="Describa el motivo o detalles de la cita..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                {editingUuid ? 'Guardar Cambios' : 'Agendar Cita'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
