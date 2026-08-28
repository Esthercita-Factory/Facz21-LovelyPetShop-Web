import React, { useState, useEffect } from 'react';
import { Pet, MedicalRecord } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { 
  Heart, 
  FileText, 
  Calendar, 
  Plus, 
  CalendarPlus, 
  Scale, 
  Syringe, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { getSpeciesAvatarComponent } from '../common/PetIcons';

export const MyPetsPage: React.FC = () => {
  const { user, showToast } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedPetForHistory, setSelectedPetForHistory] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedPetForAppointment, setSelectedPetForAppointment] = useState<Pet | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentService, setAppointmentService] = useState('Consulta General');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [submittingAppointment, setSubmittingAppointment] = useState(false);

  const [isNewPetModalOpen, setIsNewPetModalOpen] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('Perro');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState(1);
  const [newPetWeight, setNewPetWeight] = useState(5.0);
  const [newPetSymptoms, setNewPetSymptoms] = useState('');
  const [submittingPet, setSubmittingPet] = useState(false);

  // Get current datetime string formatted for min attribute
  const getCurrentMinDateTime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const loadPets = async () => {
    setLoading(true);
    try {
      let url = '/pets/my-pets';
      if (user?.owner_id) {
        url += `?ownerUuid=${encodeURIComponent(user.owner_id)}`;
      }
      let data = await apiFetch<Pet[]>(url);
      if ((!data || data.length === 0) && user?.owner_id) {
        try {
          data = await apiFetch<Pet[]>(`/pets/by-owner-uuid/${user.owner_id}`);
        } catch {}
      }
      setPets(data || []);
    } catch (e) {
      console.error('Error loading my pets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [user]);

  const openHistoryModal = async (pet: Pet) => {
    setSelectedPetForHistory(pet);
    setLoadingHistory(true);
    try {
      const records = await apiFetch<MedicalRecord[]>(`/medicalrecords/pet/${pet.uuid}`);
      setMedicalRecords(records || []);
    } catch {
      setMedicalRecords([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openAppointmentModal = (pet: Pet) => {
    setSelectedPetForAppointment(pet);
    setAppointmentError(null);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(9, 0, 0, 0);
    const tzOffset = nextDate.getTimezoneOffset() * 60000;
    setAppointmentDate(new Date(nextDate.getTime() - tzOffset).toISOString().slice(0, 16));
    setAppointmentNotes('');
    setAppointmentService('Consulta General');
    setIsAppointmentModalOpen(true);
  };

  const validateAppointmentSlot = (dateStr: string): string | null => {
    if (!dateStr) return 'Por favor seleccione una fecha y hora.';
    const selected = new Date(dateStr);
    const now = new Date();

    if (selected < now) {
      return 'No es posible agendar citas en fechas u horas pasadas.';
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

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetForAppointment) return;

    const validationError = validateAppointmentSlot(appointmentDate);
    if (validationError) {
      setAppointmentError(validationError);
      return;
    }

    setSubmittingAppointment(true);
    setAppointmentError(null);

    try {
      const body = {
        pet_uuid: selectedPetForAppointment.uuid,
        owner_uuid: selectedPetForAppointment.owner_uuid || selectedPetForAppointment.ownerUuid || user?.owner_id || '',
        scheduled_date: new Date(appointmentDate).toISOString(),
        service_type: appointmentService,
        status: 'Programada',
        notes: appointmentNotes
      };

      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      showToast(`¡Cita agendada con éxito para ${selectedPetForAppointment.name}!`);
      setIsAppointmentModalOpen(false);
    } catch (err: any) {
      setAppointmentError(err.message || 'Error al agendar cita');
    } finally {
      setSubmittingAppointment(false);
    }
  };

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPet(true);

    try {
      const body = {
        name: newPetName,
        species: newPetSpecies,
        breed: newPetBreed,
        age: newPetAge,
        weight: newPetWeight,
        symptoms: newPetSymptoms,
        ownerDocumentNumber: user?.owner_id || user?.username || '1018234567'
      };

      await apiFetch('/pets', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      showToast(`¡${newPetName} ha sido registrado exitosamente!`);
      setIsNewPetModalOpen(false);
      setNewPetName('');
      setNewPetBreed('');
      setNewPetSymptoms('');
      loadPets();
    } catch (err: any) {
      showToast(err.message || 'Error al registrar mascota', 'error');
    } finally {
      setSubmittingPet(false);
    }
  };

  const getSpeciesBadgeVariant = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes('perro')) return 'primary';
    if (s.includes('gato')) return 'pink';
    if (s.includes('conejo')) return 'warning';
    if (s.includes('ave')) return 'info';
    return 'slate';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mis Mascotas
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Expedientes clínicos digitales, citas y controles preventivos de tus consentidos.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsNewPetModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Registrar Nueva Mascota
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-indigo-600 dark:fill-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tienes mascotas registradas todavía</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 mb-6">
            Registra a tu consentido para acceder a su historial clínico digital, consultas médicas y agendamiento directo de citas.
          </p>
          <Button
            variant="primary"
            onClick={() => setIsNewPetModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Registrar a mi Mascota
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map(pet => (
            <div
              key={pet.uuid}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 space-y-5"
            >
              <div>
                {/* Top header with Custom Stylized Animal Avatar */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {getSpeciesAvatarComponent(pet.species, 'w-12 h-12', pet.name)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {pet.name}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">
                        {pet.breed || 'Sin raza especificada'}
                      </span>
                    </div>
                  </div>

                  <Badge variant="neutral" size="sm">
                    {pet.species}
                  </Badge>
                </div>

                {/* Details pill stats */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Edad:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{pet.age} año(s)</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Peso:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{pet.weight} kg</strong>
                  </div>
                </div>

                {/* Symptoms / Notes */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/60 dark:border-slate-800/60 text-xs">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                    Motivo / Observaciones
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                    {pet.symptoms || 'Control preventivo general al día.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openHistoryModal(pet)}
                  icon={<FileText className="w-3.5 h-3.5" />}
                >
                  Historial Clínico
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openAppointmentModal(pet)}
                  icon={<CalendarPlus className="w-3.5 h-3.5" />}
                >
                  Pedir Cita
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Historial Clínico */}
      {selectedPetForHistory && (
        <Modal
          isOpen={!!selectedPetForHistory}
          onClose={() => setSelectedPetForHistory(null)}
          title={
            <div className="flex items-center gap-2.5">
              {getSpeciesAvatarComponent(selectedPetForHistory.species, 'w-6 h-6')}
              <span>Expediente Clínico: <strong className="text-indigo-600">{selectedPetForHistory.name}</strong></span>
            </div>
          }
          maxWidth="lg"
        >
          <div className="space-y-4">
            {loadingHistory ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Cargando historial médico...
              </div>
            ) : medicalRecords.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Tu mascota aún no cuenta con consultas médicas registradas.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {medicalRecords.map((r, idx) => {
                  const dateStr = r.date || (r as any).created_at || new Date().toISOString();
                  const dObj = new Date(dateStr);
                  const nextVac = r.next_vaccine_date || r.nextVaccineDate;
                  const nextVacObj = nextVac ? new Date(nextVac) : null;

                  return (
                    <div
                      key={r.uuid || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {dObj.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5" /> {r.weight} kg
                        </span>
                      </div>

                      <div className="text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Diagnóstico: </span>
                        <span className="text-slate-600 dark:text-slate-300">{r.diagnosis}</span>
                      </div>

                      <div className="text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Tratamiento: </span>
                        <span className="text-slate-500 dark:text-slate-400">{r.treatment || 'Ninguno especificado.'}</span>
                      </div>

                      {nextVacObj && (
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                          <Syringe className="w-3.5 h-3.5" /> Próxima Vacuna: {nextVacObj.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setSelectedPetForHistory(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Pedir Cita */}
      {isAppointmentModalOpen && selectedPetForAppointment && (
        <Modal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          title={
            <div className="flex items-center gap-2.5">
              {getSpeciesAvatarComponent(selectedPetForAppointment.species, 'w-6 h-6')}
              <span>Agendar Cita para: <strong className="text-indigo-600">{selectedPetForAppointment.name}</strong></span>
            </div>
          }
          maxWidth="md"
        >
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            {appointmentError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{appointmentError}</span>
              </div>
            )}

            <Select
              label="Servicio Médico"
              value={appointmentService}
              onChange={e => setAppointmentService(e.target.value)}
              required
              options={[
                { value: 'Consulta General', label: 'Consulta General' },
                { value: 'Vacunación', label: 'Vacunación' },
                { value: 'Peluquería & Spa', label: 'Peluquería & Spa' },
                { value: 'Cirugía / Especialidad', label: 'Cirugía / Especialidad' },
                { value: 'Control Preventivo', label: 'Control Preventivo' }
              ]}
            />

            <div>
              <Input
                label="Fecha y Hora Deseada"
                type="datetime-local"
                min={getCurrentMinDateTime()}
                value={appointmentDate}
                onChange={e => {
                  setAppointmentDate(e.target.value);
                  setAppointmentError(null);
                }}
                required
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Lun a Sáb: 8:00 AM - 7:00 PM | Dom: 8:00 AM - 2:00 PM
              </p>
            </div>

            <Textarea
              label="Motivo de la consulta / Observaciones"
              placeholder="Describa brevemente los síntomas o requerimientos..."
              value={appointmentNotes}
              onChange={e => setAppointmentNotes(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAppointmentModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submittingAppointment}
              >
                Confirmar Cita
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Registrar Mascota */}
      {isNewPetModalOpen && (
        <Modal
          isOpen={isNewPetModalOpen}
          onClose={() => setIsNewPetModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Registrar Nueva Mascota</span>
            </div>
          }
          maxWidth="md"
        >
          <form onSubmit={handleCreatePet} className="space-y-4">
            <Input
              label="Nombre de la Mascota"
              placeholder="Ej: Toby"
              value={newPetName}
              onChange={e => setNewPetName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Especie"
                value={newPetSpecies}
                onChange={e => setNewPetSpecies(e.target.value)}
                required
                options={[
                  { value: 'Perro', label: 'Perro' },
                  { value: 'Gato', label: 'Gato' },
                  { value: 'Conejo', label: 'Conejo' },
                  { value: 'Ave', label: 'Ave' },
                  { value: 'Otro', label: 'Otro' }
                ]}
              />

              <Input
                label="Raza"
                placeholder="Ej: Criollo / Mestizo"
                value={newPetBreed}
                onChange={e => setNewPetBreed(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Edad (Años)"
                type="number"
                min="0"
                value={newPetAge}
                onChange={e => setNewPetAge(parseInt(e.target.value, 10) || 0)}
                required
              />

              <Input
                label="Peso (Kg)"
                type="number"
                step="0.1"
                min="0"
                value={newPetWeight}
                onChange={e => setNewPetWeight(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <Textarea
              label="Motivo de registro / Síntomas"
              placeholder="Ej: Control de vacunas, desparasitación..."
              value={newPetSymptoms}
              onChange={e => setNewPetSymptoms(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsNewPetModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submittingPet}
              >
                Registrar Mascota
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
