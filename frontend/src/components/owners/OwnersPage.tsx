import React, { useState, useEffect } from 'react';
import { Owner } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Search, Plus, Users, Edit3, Trash2, IdCard, Phone, Mail, MapPin, PawPrint } from 'lucide-react';

export const OwnersPage: React.FC = () => {
  const { showToast } = useAuth();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [docType, setDocType] = useState('CC');
  const [docNum, setDocNum] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOwners = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Owner[]>('/owners');
      setOwners(data || []);
    } catch (e) {
      console.error('Error loading owners:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setDocType('CC');
    setDocNum('');
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (o: Owner) => {
    const d = o.documentNumber || o.document_number || '';
    setEditingDoc(d);
    setDocType(o.documentType || o.document_type || 'CC');
    setDocNum(d);
    setName(o.name);
    setPhone(o.phone);
    setEmail(o.email || '');
    setAddress(o.address || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (o: Owner) => {
    const d = o.documentNumber || o.document_number || o.uuid;
    if (!confirm(`¿Está seguro de eliminar al propietario '${o.name}'?`)) return;
    try {
      await apiFetch(`/owners/${d}`, { method: 'DELETE' });
      showToast(`Propietario '${o.name}' eliminado con éxito.`);
      loadOwners();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingDoc) {
        const body = {
          newDocumentType: docType,
          newDocumentNumber: docNum,
          name,
          phone,
          email,
          address
        };
        await apiFetch(`/owners/${editingDoc}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        showToast('¡Propietario actualizado exitosamente!');
      } else {
        const body = {
          documentType: docType,
          documentNumber: docNum,
          name,
          phone,
          email,
          address
        };
        await apiFetch('/owners', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showToast('¡Propietario registrado con éxito!');
      }

      setIsModalOpen(false);
      loadOwners();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOwners = owners.filter(o => {
    const term = searchTerm.toLowerCase().trim();
    const doc = (o.documentNumber || o.document_number || '').toLowerCase();
    return !term ||
      o.name.toLowerCase().includes(term) ||
      doc.includes(term) ||
      o.phone.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de Propietarios
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directorio de clientes, datos de contacto y mascotas asociadas.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Nuevo Propietario
        </Button>
      </div>

      {/* Filter */}
      <div className="max-w-md">
        <Input
          placeholder="Buscar por nombre, documento o teléfono..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredOwners.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No se encontraron propietarios</h4>
          <p className="text-xs text-slate-400 mt-1">Intenta con otros términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map(o => {
            const dt = o.documentType || o.document_type || 'CC';
            const dn = o.documentNumber || o.document_number || '';
            const petsList = o.pets || [];

            return (
              <div
                key={o.uuid}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {o.name}
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">
                          {dt}: {dn}
                        </span>
                      </div>
                    </div>

                    <Badge variant="info" size="sm">
                      {petsList.length} mascota(s)
                    </Badge>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{o.phone || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{o.email || 'Sin correo registrado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{o.address || 'Sin dirección'}</span>
                    </div>
                  </div>

                  {/* Associated Pets */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Mascotas Vinculadas
                    </span>
                    {petsList.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Sin mascotas registradas</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {petsList.map(p => (
                          <Badge key={p.uuid} variant="slate" size="sm">
                            🐾 {p.name} ({p.species})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(o)}
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(o)}
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

      {/* Modal: Form Propietario */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDoc ? 'Editar Propietario' : 'Registrar Nuevo Propietario'}
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Tipo de Documento"
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
                label="Número de Documento"
                placeholder="Ej: 1018234567"
                value={docNum}
                onChange={e => setDocNum(e.target.value)}
                required
              />
            </div>

            <Input
              label="Nombre Completo"
              placeholder="Ej: Ana María Morales"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

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
                label="Correo Electrónico"
                type="email"
                placeholder="ana@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <Input
              label="Dirección de Residencia"
              placeholder="Ej: Calle 45 # 12-34"
              value={address}
              onChange={e => setAddress(e.target.value)}
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
                {editingDoc ? 'Guardar Cambios' : 'Registrar Propietario'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
