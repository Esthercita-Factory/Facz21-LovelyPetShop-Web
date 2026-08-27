import React, { useState, useEffect } from 'react';
import { Pet, MedicalRecord } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { FileText, Calendar, Scale, Syringe, Plus, Clock } from 'lucide-react';

interface MedicalRecordModalProps {
  pet: Pet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  pet,
  isOpen,
  onClose
}) => {
  const { showToast } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // New consultation state
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState(pet ? pet.weight : 0);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [nextVaccineDate, setNextVaccineDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadHistory = async () => {
    if (!pet) return;
    setLoading(true);
    try {
      const data = await apiFetch<MedicalRecord[]>(`/medicalrecords/pet/${pet.uuid}`);
      setRecords(data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && pet) {
      loadHistory();
      setWeight(pet.weight || 0);
      setDate(new Date().toISOString().split('T')[0]);
      setDiagnosis('');
      setTreatment('');
      setNextVaccineDate('');
    }
  }, [isOpen, pet]);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    setSubmitting(true);

    try {
      const body = {
        pet_uuid: pet.uuid,
        date: new Date(date).toISOString(),
        weight: Number(weight),
        diagnosis,
        treatment,
        next_vaccine_date: nextVaccineDate ? new Date(nextVaccineDate).toISOString() : null
      };

      await apiFetch('/medicalrecords', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      showToast('¡Ficha clínica registrada con éxito!');
      setDiagnosis('');
      setTreatment('');
      setNextVaccineDate('');
      loadHistory();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar ficha clínica', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!pet) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span>Expediente Clínico: <strong className="text-indigo-600">{pet.name}</strong></span>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Past Records Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Historial de Consultas Médicas ({records.length})
            </h4>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Cargando expediente...</p>
            ) : records.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
                No hay consultas registradas para este paciente.
              </div>
            ) : (
              records.map((r, idx) => {
                const dateStr = r.date || (r as any).created_at || new Date().toISOString();
                const dObj = new Date(dateStr);
                const nextVac = r.next_vaccine_date || r.nextVaccineDate;
                const nextVacObj = nextVac ? new Date(nextVac) : null;

                return (
                  <div
                    key={r.uuid || idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dObj.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5" /> {r.weight} kg
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">Dx: </span>
                      <span className="text-slate-600 dark:text-slate-300">{r.diagnosis}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">Tratamiento: </span>
                      <span className="text-slate-500 dark:text-slate-400">{r.treatment || 'N/A'}</span>
                    </div>

                    {nextVacObj && (
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                        <Syringe className="w-3.5 h-3.5" /> Próxima Vacuna: {nextVacObj.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* New Consultation Form */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Registrar Nueva Consulta Médica</span>
          </div>

          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Fecha de Atención"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
              <Input
                label="Peso Actual (Kg)"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <Input
              label="Diagnóstico Médico"
              placeholder="Ej: Faringitis leve, Vacunación anual..."
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              required
            />

            <Textarea
              label="Tratamiento & Prescripción"
              placeholder="Medicamentos recetados, dosis y recomendaciones..."
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
              rows={2}
            />

            <Input
              label="Fecha Próxima Vacuna (Opcional)"
              type="date"
              value={nextVaccineDate}
              onChange={e => setNextVaccineDate(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cerrar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                Guardar Ficha
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
