import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Search, Plus, Stethoscope, Edit3, Trash2, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { showToast } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Veterinario(a)');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [schedule, setSchedule] = useState('L-V 8am-5pm');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Employee[]>('/employees');
      setEmployees(data || []);
    } catch (e) {
      console.error('Error loading employees:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleOpenCreate = () => {
    setEditingUuid(null);
    setName('');
    setRole('Veterinario(a)');
    setSpecialty('');
    setPhone('');
    setEmail('');
    setSchedule('L-V 8am-5pm');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: Employee) => {
    setEditingUuid(e.uuid);
    setName(e.name);
    setRole(e.role);
    setSpecialty(e.specialty || '');
    setPhone(e.phone);
    setEmail(e.email);
    setSchedule(e.schedule || 'L-V 8am-5pm');
    setIsActive(e.is_active ?? e.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: Employee) => {
    if (!confirm(`¿Está seguro de eliminar al empleado '${e.name}'?`)) return;
    try {
      await apiFetch(`/employees/${e.uuid}`, { method: 'DELETE' });
      showToast(`Empleado '${e.name}' eliminado con éxito.`);
      loadEmployees();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        name,
        role,
        specialty,
        phone,
        email,
        schedule,
        is_active: isActive,
        isActive: isActive
      };

      if (editingUuid) {
        await apiFetch(`/employees/${editingUuid}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        showToast('¡Empleado actualizado exitosamente!');
      } else {
        await apiFetch('/employees', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showToast('¡Empleado registrado con éxito!');
      }

      setIsModalOpen(false);
      loadEmployees();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar empleado', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const term = searchTerm.toLowerCase().trim();
    return !term ||
      e.name.toLowerCase().includes(term) ||
      e.role.toLowerCase().includes(term) ||
      (e.specialty && e.specialty.toLowerCase().includes(term)) ||
      e.phone.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Personal de la Clínica
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestión de médicos veterinarios, especialistas y equipo de recepción.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Nuevo Empleado
        </Button>
      </div>

      {/* Filter */}
      <div className="max-w-md">
        <Input
          placeholder="Buscar por nombre, cargo o especialidad..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No se encontraron empleados</h4>
          <p className="text-xs text-slate-400 mt-1">Intenta con otros términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(e => {
            const activeState = e.is_active ?? e.isActive ?? true;

            return (
              <div
                key={e.uuid}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {e.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {e.role} {e.specialty ? `• ${e.specialty}` : ''}
                        </span>
                      </div>
                    </div>

                    <Badge variant={activeState ? 'success' : 'danger'} size="sm">
                      {activeState ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{e.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{e.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Horario: {e.schedule || 'L-V 8am-5pm'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(e)}
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(e)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Form Empleado */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUuid ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input
              label="Nombre Completo"
              placeholder="Ej: Dr. Carlos Pérez"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Cargo / Rol"
                value={role}
                onChange={e => setRole(e.target.value)}
                required
                options={[
                  { value: 'Veterinario(a)', label: 'Veterinario(a)' },
                  { value: 'Cirujano(a)', label: 'Cirujano(a)' },
                  { value: 'Especialista', label: 'Especialista' },
                  { value: 'Peluquero(a)', label: 'Peluquero(a)' },
                  { value: 'Asistente', label: 'Asistente' },
                  { value: 'Recepción', label: 'Recepción' }
                ]}
              />

              <Input
                label="Especialidad (Opcional)"
                placeholder="Ej: Odontología, Cirugía"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Teléfono Celular"
                type="tel"
                placeholder="3001234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />

              <Input
                label="Correo Institucional"
                type="email"
                placeholder="carlos@lovelypet.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <Input
              label="Horario Laboral"
              placeholder="Ej: L-V 8:00 AM - 5:00 PM"
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
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
                {editingUuid ? 'Guardar Cambios' : 'Registrar Empleado'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
