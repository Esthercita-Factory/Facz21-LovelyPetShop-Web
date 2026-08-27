import React, { useState } from 'react';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { User, PawPrint, CheckCircle2, UserCheck } from 'lucide-react';

interface CombinedRegistrationPageProps {
  onSuccess?: () => void;
}

export const CombinedRegistrationPage: React.FC<CombinedRegistrationPageProps> = ({
  onSuccess
}) => {
  const { showToast } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Owner state
  const [docType, setDocType] = useState('CC');
  const [docNumber, setDocNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');

  // Pet state
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('Perro');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState(1);
  const [weight, setWeight] = useState(5.0);
  const [symptoms, setSymptoms] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        docType,
        docNumber,
        ownerName,
        ownerPhone,
        ownerEmail,
        ownerAddress,
        petName,
        species,
        breed,
        age: Number(age),
        weight: Number(weight),
        symptoms
      };

      await apiFetch('/pets/with-owner', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      showToast(`¡Registro exitoso de ${ownerName} y su mascota ${petName}!`);
      
      // Reset form
      setDocNumber('');
      setOwnerName('');
      setOwnerPhone('');
      setOwnerEmail('');
      setOwnerAddress('');
      setPetName('');
      setBreed('');
      setAge(1);
      setWeight(5.0);
      setSymptoms('');

      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Error al completar el registro', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Registro Rápido Conjunto (1 Paso)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Registra al propietario y su mascota simultáneamente en un solo formulario unificado.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
            {/* Column 1: Propietario */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Datos del Propietario</h3>
                  <span className="text-xs text-slate-400">Información personal y de contacto</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label="Tipo Documento"
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  required
                  options={[
                    { value: 'CC', label: 'CC - Cédula Ciudadanía' },
                    { value: 'CE', label: 'CE - Cédula Extranjería' },
                    { value: 'TI', label: 'TI - Tarjeta Identidad' },
                    { value: 'PASAPORTE', label: 'Pasaporte' },
                    { value: 'NIT', label: 'NIT' }
                  ]}
                />

                <Input
                  label="Número Documento"
                  placeholder="Ej: 1018234567"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Nombre Completo del Dueño"
                placeholder="Ej: Ana María Morales"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Teléfono Celular"
                  type="tel"
                  placeholder="3001234567"
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value)}
                  required
                />

                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="ana@correo.com"
                  value={ownerEmail}
                  onChange={e => setOwnerEmail(e.target.value)}
                />
              </div>

              <Input
                label="Dirección de Residencia"
                placeholder="Ej: Carrera 15 # 45-20"
                value={ownerAddress}
                onChange={e => setOwnerAddress(e.target.value)}
              />
            </div>

            {/* Divider on desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200/60 dark:bg-slate-800" />

            {/* Column 2: Mascota */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-pink-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Datos de la Mascota</h3>
                  <span className="text-xs text-slate-400">Ficha inicial del paciente</span>
                </div>
              </div>

              <Input
                label="Nombre de la Mascota"
                placeholder="Ej: Toby"
                value={petName}
                onChange={e => setPetName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

                <Input
                  label="Raza"
                  placeholder="Ej: Schnauzer / Mestizo"
                  value={breed}
                  onChange={e => setBreed(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Edad (Años)"
                  type="number"
                  min="0"
                  value={age}
                  onChange={e => setAge(parseInt(e.target.value, 10) || 0)}
                  required
                />

                <Input
                  label="Peso (Kg)"
                  type="number"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <Textarea
                label="Síntomas / Motivo de Visita"
                placeholder="Motivo de la primera consulta o servicio solicitado..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              icon={<CheckCircle2 className="w-5 h-5" />}
              className="w-full sm:w-auto px-8"
            >
              Completar Registro Conjunto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
