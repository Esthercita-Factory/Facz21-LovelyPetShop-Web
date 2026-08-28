import React, { useState, useEffect } from 'react';
import { Hospitalization } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { 
  Plus, 
  Search, 
  BedDouble, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  HeartPulse,
  Activity
} from 'lucide-react';
import { getSpeciesAvatarComponent } from '../common/PetIcons';

export const HospitalizationPage: React.FC = () => {
  const { showToast, user } = useAuth();
  const isVet = user?.role === 'Veterinario';

  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('activos');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('Perro');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [cageNumber, setCageNumber] = useState('C-01');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<Hospitalization['status']>('En Observación');
  const [attendingVet, setAttendingVet] = useState(user?.full_name || 'Dr. Médico Veterinario');
  const [medicationPlan, setMedicationPlan] = useState('');
  const [dietNotes, setDietNotes] = useState('');
  const [evolutionNotes, setEvolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadHospitalizations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Hospitalization[]>('/hospitalizations');
      setHospitalizations(data || []);
    } catch (e) {
      console.error('Error loading hospitalizations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitalizations();
  }, []);

  const handleOpenCreate = () => {
    setEditingUuid(null);
    setPetName('');
    setSpecies('Perro');
    setOwnerName('');
    setOwnerPhone('');
    setCageNumber('C-01');
    setReason('');
    setStatus('En Observación');
    setAttendingVet(user?.full_name || 'Dr. Médico Veterinario');
    setMedicationPlan('');
    setDietNotes('');
    setEvolutionNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Hospitalization) => {
    setEditingUuid(h.uuid);
    setPetName(h.pet_name);
    setSpecies(h.species);
    setOwnerName(h.owner_name);
    setOwnerPhone(h.owner_phone);
    setCageNumber(h.cage_number);
    setReason(h.reason);
    setStatus(h.status);
    setAttendingVet(h.attending_vet || user?.full_name || '');
    setMedicationPlan(h.medication_plan || '');
    setDietNotes(h.diet_notes || '');
    setEvolutionNotes(h.evolution_notes || '');
    setIsModalOpen(true);
  };

  const handleDischarge = async (h: Hospitalization) => {
    if (!confirm(`¿Dar de alta médica al paciente '${h.pet_name}' y liberar la jaula ${h.cage_number}?`)) return;
    try {
      await apiFetch(`/hospitalizations/${h.uuid}`, {
        method: 'PUT',
        body: JSON.stringify({ ...h, status: 'Alta', discharge_date: new Date().toISOString() })
      });
      showToast(`¡Paciente '${h.pet_name}' dado de alta con éxito!`);
      loadHospitalizations();
    } catch (err: any) {
      showToast(err.message || 'Error al dar de alta', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        pet_name: petName.trim(),
        species,
        owner_name: ownerName.trim(),
        owner_phone: ownerPhone.trim(),
        cage_number: cageNumber.trim(),
        reason: reason.trim(),
        status,
        attending_vet: attendingVet.trim(),
        medication_plan: medicationPlan.trim(),
        diet_notes: dietNotes.trim(),
        evolution_notes: evolutionNotes.trim()
      };

      if (editingUuid) {
        await apiFetch(`/hospitalizations/${editingUuid}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        showToast('¡Registro de hospitalización actualizado!');
      } else {
        await apiFetch('/hospitalizations', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showToast('¡Paciente internado registrado con éxito!');
      }

      setIsModalOpen(false);
      loadHospitalizations();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar hospitalización', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHospitalizations = hospitalizations.filter(h => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      h.pet_name.toLowerCase().includes(term) ||
      h.owner_name.toLowerCase().includes(term) ||
      h.cage_number.toLowerCase().includes(term) ||
      h.reason.toLowerCase().includes(term);

    let matchesStatus = true;
    if (statusFilter === 'activos') {
      matchesStatus = h.status !== 'Alta';
    } else if (statusFilter === 'altas') {
      matchesStatus = h.status === 'Alta';
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Crítico':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60">
            <AlertCircle className="w-3 h-3" /> Crítico
          </span>
        );
      case 'Post-Quirúrgico':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
            <HeartPulse className="w-3 h-3" /> Post-Quirúrgico
          </span>
        );
      case 'En Observación':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
            <Activity className="w-3 h-3" /> En Observación
          </span>
        );
      case 'En Recuperación':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60">
            <Clock className="w-3 h-3" /> En Recuperación
          </span>
        );
      case 'Alta':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" /> Alta Médica
          </span>
        );
      default:
        return <Badge variant="neutral">{st}</Badge>;
    }
  };

  const activeCount = hospitalizations.filter(h => h.status !== 'Alta').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hospitalización & Caniles
            </h2>
            <Badge variant="neutral" size="sm">
              {activeCount} Paciente(s) Internado(s)
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control de pacientes internados, planes de dosificación horaria y evolución médica en guardia.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Ingresar a Hospitalización
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Buscar por paciente, jaula o motivo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {[
            { id: 'activos', label: 'Pacientes Internados' },
            { id: 'altas', label: 'Altas Médicas' },
            { id: 'todos', label: 'Historial Completo' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredHospitalizations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BedDouble className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No hay pacientes en esta vista</h4>
          <p className="text-xs text-slate-400 mt-1">Todas las jaulas están disponibles o limpia los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitalizations.map(h => {
            const admDate = new Date(h.admission_date);

            return (
              <div
                key={h.uuid}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {getSpeciesAvatarComponent(h.species, 'w-11 h-11', h.pet_name)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {h.pet_name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold">
                            {h.cage_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {h.species} • Dueño: {h.owner_name}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(h.status)}
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Motivo de Internación:</span>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{h.reason}</p>
                    </div>

                    {h.medication_plan && (
                      <div className="pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40">
                        <span className="text-slate-400 font-medium">Plan de Medicación:</span>
                        <p className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px] mt-0.5">{h.medication_plan}</p>
                      </div>
                    )}

                    {h.evolution_notes && (
                      <div className="pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40">
                        <span className="text-slate-400 font-medium">Evolución / Observaciones:</span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">{h.evolution_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40 text-[11px]">
                      <span className="text-slate-400 font-medium">Ingreso: {admDate.toLocaleDateString('es-CO')}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px]">Vet: {h.attending_vet || 'Staff'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(h)}
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Actualizar
                  </Button>

                  {h.status !== 'Alta' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleDischarge(h)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Dar de Alta
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled
                    >
                      Alta Emitida
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUuid ? 'Actualizar Ficha de Hospitalización' : 'Ingreso a Hospitalización'}
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre del Paciente"
                placeholder="Ej: Rocky"
                value={petName}
                onChange={e => setPetName(e.target.value)}
                required
              />

              <Select
                label="Especie"
                value={species}
                onChange={e => setSpecies(e.target.value)}
                required
                options={[
                  { value: 'Perro', label: 'Perro' },
                  { value: 'Gato', label: 'Gato' },
                  { value: 'Conejo', label: 'Conejo' },
                  { value: 'Ave', label: 'Ave' },
                  { value: 'Otro', label: 'Otro' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre del Propietario"
                placeholder="Ej: Carlos Silva"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                required
              />

              <Input
                label="Teléfono de Contacto"
                placeholder="Ej: 3001234567"
                value={ownerPhone}
                onChange={e => setOwnerPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Número de Jaula / Canil"
                placeholder="Ej: C-01, C-02, F-01"
                value={cageNumber}
                onChange={e => setCageNumber(e.target.value)}
                required
              />

              <Select
                label="Estado del Paciente"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                required
                options={[
                  { value: 'En Observación', label: 'En Observación' },
                  { value: 'Post-Quirúrgico', label: 'Post-Quirúrgico' },
                  { value: 'Crítico', label: 'Crítico' },
                  { value: 'En Recuperación', label: 'En Recuperación' },
                  { value: 'Alta', label: 'Alta Médica' }
                ]}
              />
            </div>

            <Input
              label="Médico Veterinario a Cargo"
              placeholder="Ej: Dra. Andrea Ruiz"
              value={attendingVet}
              onChange={e => setAttendingVet(e.target.value)}
            />

            <Textarea
              label="Motivo de Ingreso / Diagnóstico"
              placeholder="Describa el motivo médico de la internación..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              rows={2}
            />

            <Textarea
              label="Plan de Medicación & Dosificación Horaria"
              placeholder="Ej: Amoxicilina 250mg cada 8h, Dipirona 0.5ml cada 12h..."
              value={medicationPlan}
              onChange={e => setMedicationPlan(e.target.value)}
              rows={2}
            />

            <Textarea
              label="Notas de Evolución Médica"
              placeholder="Registro de signos vitales, temperatura, micción, ingesta..."
              value={evolutionNotes}
              onChange={e => setEvolutionNotes(e.target.value)}
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
                {editingUuid ? 'Guardar Cambios' : 'Ingresar Paciente'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
