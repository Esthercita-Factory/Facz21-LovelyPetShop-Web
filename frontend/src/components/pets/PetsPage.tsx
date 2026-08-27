import React, { useState, useEffect } from 'react';
import { Pet, Owner } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { MedicalRecordModal } from './MedicalRecordModal';
import { Search, Plus, PawPrint, FileText, Edit3, Trash2, Cake, Scale, IdCard } from 'lucide-react';

export const PetsPage: React.FC = () => {
  const { showToast } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPetUuid, setEditingPetUuid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Perro');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState(1);
  const [weight, setWeight] = useState(5.0);
  const [symptoms, setSymptoms] = useState('');
  const [ownerDoc, setOwnerDoc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Medical Record Modal
  const [selectedPetForMedical, setSelectedPetForMedical] = useState<Pet | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [petsData, ownersData] = await Promise.all([
        apiFetch<Pet[]>('/pets'),
        apiFetch<Owner[]>('/owners')
      ]);
      setPets(petsData || []);
      setOwners(ownersData || []);
    } catch (e) {
      console.error('Error loading pets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPetUuid(null);
    setName('');
    setSpecies('Perro');
    setBreed('');
    setAge(1);
    setWeight(5.0);
    setSymptoms('');
    setOwnerDoc(owners[0]?.documentNumber || owners[0]?.document_number || '');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (p: Pet) => {
    setEditingPetUuid(p.uuid);
    setName(p.name);
    setSpecies(p.species);
    setBreed(p.breed || '');
    setAge(p.age);
    setWeight(p.weight);
    setSymptoms(p.symptoms || '');
    setOwnerDoc(p.ownerDocumentNumber || p.owner_document_number || '');
    setIsFormModalOpen(true);
  };

  const handleDelete = async (p: Pet) => {
    if (!confirm(`¿Está seguro de eliminar a la mascota '${p.name}'?`)) return;
    try {
      await apiFetch(`/pets/${p.uuid}`, { method: 'DELETE' });
      showToast(`Mascota '${p.name}' eliminada con éxito.`);
      loadData();
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
        species,
        breed,
        age: Number(age),
        weight: Number(weight),
        symptoms,
        ownerDocumentNumber: ownerDoc
      };

      if (editingPetUuid) {
        await apiFetch(`/pets/${editingPetUuid}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        showToast('¡Mascota actualizada con éxito!');
      } else {
        await apiFetch('/pets', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showToast('¡Mascota registrada exitosamente!');
      }

      setIsFormModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPets = pets.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const doc = (p.ownerDocumentNumber || p.owner_document_number || '').toLowerCase();
    const matchesSearch = !term ||
      p.name.toLowerCase().includes(term) ||
      (p.breed && p.breed.toLowerCase().includes(term)) ||
      doc.includes(term);

    const matchesSpecies = !speciesFilter || p.species.toLowerCase() === speciesFilter.toLowerCase();
    return matchesSearch && matchesSpecies;
  });

  const getSpeciesBadgeVariant = (s: string) => {
    const low = s.toLowerCase();
    if (low.includes('perro')) return 'primary';
    if (low.includes('gato')) return 'pink';
    if (low.includes('conejo')) return 'warning';
    if (low.includes('ave')) return 'info';
    return 'slate';
  };

  const getSpeciesEmoji = (s: string) => {
    const low = s.toLowerCase();
    if (low.includes('perro')) return '🐶';
    if (low.includes('gato')) return '🐱';
    if (low.includes('conejo')) return '🐰';
    if (low.includes('ave')) return '🦜';
    return '🐾';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de Pacientes
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directorio médico, expedientes clínicos y control de salud animal.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Nueva Mascota
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-8">
          <Input
            placeholder="Buscar por nombre, raza o cédula del propietario..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="sm:col-span-4">
          <Select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            options={[
              { value: '', label: 'Todas las especies' },
              { value: 'Perro', label: 'Perros' },
              { value: 'Gato', label: 'Gatos' },
              { value: 'Conejo', label: 'Conejos' },
              { value: 'Ave', label: 'Aves' },
              { value: 'Otro', label: 'Otros' }
            ]}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <PawPrint className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No se encontraron mascotas</h4>
          <p className="text-xs text-slate-400 mt-1">Intenta con otros criterios de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map(p => {
            const doc = p.ownerDocumentNumber || p.owner_document_number || 'N/A';

            return (
              <div
                key={p.uuid}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-2xl shrink-0">
                        {getSpeciesEmoji(p.species)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {p.name}
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">
                          {p.breed || 'Sin raza'}
                        </span>
                      </div>
                    </div>

                    <Badge variant={getSpeciesBadgeVariant(p.species) as any} size="sm">
                      {p.species}
                    </Badge>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5"><Cake className="w-3.5 h-3.5" /> Edad:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{p.age} año(s)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Peso:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{p.weight} kg</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5"><IdCard className="w-3.5 h-3.5" /> Doc Dueño:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">{doc}</strong>
                    </div>
                  </div>

                  {p.symptoms && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/60 dark:border-slate-800/60 text-xs">
                      <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        Síntomas / Motivo
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{p.symptoms}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedPetForMedical(p)}
                    icon={<FileText className="w-3.5 h-3.5" />}
                  >
                    Historial Clínico
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEdit(p)}
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(p)}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Form Mascota (Crear / Editar) */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={editingPetUuid ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Select
              label="Propietario Asociado"
              value={ownerDoc}
              onChange={e => setOwnerDoc(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Propietario --</option>
              {owners.map(o => {
                const d = o.documentNumber || o.document_number;
                const dt = o.documentType || o.document_type || 'CC';
                return (
                  <option key={o.uuid} value={d}>
                    {o.name} ({dt} {d})
                  </option>
                );
              })}
            </Select>

            <Input
              label="Nombre de la Mascota"
              placeholder="Ej: Max"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="Ej: Golden Retriever"
                value={breed}
                onChange={e => setBreed(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              label="Síntomas / Motivo de Consulta"
              placeholder="Describa el motivo de consulta u observaciones..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                {editingPetUuid ? 'Guardar Cambios' : 'Registrar Mascota'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Medical Records */}
      {selectedPetForMedical && (
        <MedicalRecordModal
          pet={selectedPetForMedical}
          isOpen={!!selectedPetForMedical}
          onClose={() => setSelectedPetForMedical(null)}
        />
      )}
    </div>
  );
};
