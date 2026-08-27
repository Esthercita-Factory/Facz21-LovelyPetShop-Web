import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Search, Plus, Boxes, Edit3, Trash2, Tag, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { showToast, user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Alimentos');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [stock, setStock] = useState(10);
  const [supplier, setSupplier] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCommercial, setIsCommercial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Product[]>('/products');
      setProducts(data || []);
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingUuid(null);
    setName('');
    setSku('');
    setCategory('Alimentos');
    setDescription('');
    setPrice(10000);
    setCostPrice(7000);
    setStock(10);
    setSupplier('');
    setImageUrl('');
    setIsCommercial(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingUuid(p.uuid);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setDescription(p.description || '');
    setPrice(p.price);
    setCostPrice(p.cost_price ?? p.costPrice ?? 0);
    setStock(p.stock);
    setSupplier(p.supplier || '');
    setImageUrl(p.image_url || p.imageUrl || '');
    setIsCommercial(p.is_commercial ?? p.isCommercial ?? true);
    setIsModalOpen(true);
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Está seguro de eliminar el producto '${p.name}'?`)) return;
    try {
      await apiFetch(`/products/${p.uuid}`, { method: 'DELETE' });
      showToast(`Producto '${p.name}' eliminado con éxito.`);
      loadProducts();
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
        sku,
        category,
        description,
        price: Number(price),
        cost_price: Number(costPrice),
        costPrice: Number(costPrice),
        stock: Number(stock),
        supplier,
        image_url: imageUrl,
        imageUrl: imageUrl,
        is_commercial: isCommercial,
        isCommercial: isCommercial
      };

      if (editingUuid) {
        await apiFetch(`/products/${editingUuid}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        showToast('¡Producto actualizado exitosamente!');
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        showToast('¡Producto registrado con éxito!');
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar producto', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    return !term ||
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Inventario & Insumos Médicos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control de existencias, costos internos y catálogo de productos comerciales.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Nuevo Producto
        </Button>
      </div>

      {/* Filter */}
      <div className="max-w-md">
        <Input
          placeholder="Buscar por nombre, SKU o categoría..."
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
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Boxes className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No se encontraron productos</h4>
          <p className="text-xs text-slate-400 mt-1">Intenta con otros términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => {
            const isVisible = p.is_commercial ?? p.isCommercial ?? true;
            const cost = p.cost_price ?? p.costPrice;

            return (
              <div
                key={p.uuid}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
                        <Boxes className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          SKU: {p.sku}
                        </span>
                      </div>
                    </div>

                    <Badge variant="purple" size="sm">
                      {p.category}
                    </Badge>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Precio Venta (Cliente):</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                        ${p.price.toLocaleString('es-CO')}
                      </strong>
                    </div>

                    {isAdmin && cost !== undefined && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                        <span className="text-slate-400 font-medium">Costo Interno:</span>
                        <strong className="text-slate-600 dark:text-slate-300">
                          ${cost.toLocaleString('es-CO')}
                        </strong>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                      <span className="text-slate-400 font-medium">Stock Disponible:</span>
                      <strong className={`font-bold ${p.stock <= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {p.stock} unidades
                      </strong>
                    </div>
                  </div>

                  {/* Commercial toggle badge */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Visibilidad Tienda Virtual:</span>
                    {isVisible ? (
                      <Badge variant="success" size="sm" className="gap-1">
                        <Eye className="w-3 h-3" /> Visible
                      </Badge>
                    ) : (
                      <Badge variant="slate" size="sm" className="gap-1">
                        <EyeOff className="w-3 h-3" /> Solo Interno
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
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
            );
          })}
        </div>
      )}

      {/* Modal: Form Producto */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUuid ? 'Editar Producto' : 'Registrar Nuevo Producto'}
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre del Producto"
                placeholder="Ej: Vacuna Séxtuple"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />

              <Input
                label="SKU / Código"
                placeholder="Ej: VAC-001"
                value={sku}
                onChange={e => setSku(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Categoría"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                options={[
                  { value: 'Alimentos', label: 'Alimentos' },
                  { value: 'Farmacia y Cuidado', label: 'Farmacia y Cuidado' },
                  { value: 'Medicamentos / Insumos', label: 'Medicamentos / Insumos' },
                  { value: 'Accesorios', label: 'Accesorios' },
                  { value: 'Snacks', label: 'Snacks' },
                  { value: 'Higiene', label: 'Higiene' },
                  { value: 'Juguetes', label: 'Juguetes' },
                  { value: 'Otro', label: 'Otro' }
                ]}
              />

              <Input
                label="Proveedor"
                placeholder="Nombre de laboratorio o proveedor"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Precio Venta ($)"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Costo Interno ($)"
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
              />

              <Input
                label="Stock"
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(parseInt(e.target.value, 10) || 0)}
                required
              />
            </div>

            <Input
              label="URL de Imagen (Opcional)"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />

            <Textarea
              label="Descripción Comercial"
              placeholder="Descripción detallada del producto para los clientes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is-commercial-check"
                checked={isCommercial}
                onChange={e => setIsCommercial(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="is-commercial-check" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Mostrar en la Tienda Virtual de Clientes
              </label>
            </div>

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
                {editingUuid ? 'Guardar Cambios' : 'Registrar Producto'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
