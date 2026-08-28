import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { apiFetch } from '../../services/api';
import { Input } from '../common/Input';
import { Badge, getCategoryBadgeVariant } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Search, ShoppingBag, Info, Check, PackageOpen } from 'lucide-react';

export const StorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'Alimentos', label: 'Alimentos' },
    { id: 'Farmacia y Cuidado', label: 'Farmacia y Cuidado' },
    { id: 'Accesorios', label: 'Accesorios' },
    { id: 'Snacks', label: 'Snacks' },
    { id: 'Higiene', label: 'Higiene' },
    { id: 'Juguetes', label: 'Juguetes' },
  ];

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Product[]>('/products/catalog');
      setProducts(data);
    } catch (e) {
      console.error('Error loading catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'todos' || p.category === categoryFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      p.name.toLowerCase().includes(term) || 
      (p.description && p.description.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Tienda de Mascotas
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Explora productos seleccionados y certificados con precios finales al consumidor.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Filter */}
      <div className="max-w-md">
        <Input
          placeholder="Buscar por nombre de producto o descripción..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <PackageOpen className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No se encontraron productos</h4>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <div
              key={p.uuid}
              className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-200 group"
            >
              {/* Clean photo without any overlay banner */}
              <div className="aspect-4/3 w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                {p.image_url || p.imageUrl ? (
                  <img
                    src={p.image_url || p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                    <ShoppingBag className="w-10 h-10 opacity-40" />
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {p.description || 'Producto garantizado de alta calidad para el cuidado de mascotas.'}
                  </p>

                  {/* Category pill cleanly placed beneath description */}
                  <div className="mt-2.5">
                    <Badge variant={getCategoryBadgeVariant(p.category)} size="sm">
                      {p.category}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                      ${p.price.toLocaleString('es-CO')}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> En Stock
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedProduct(p)}
                    icon={<Info className="w-3.5 h-3.5" />}
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <span>{selectedProduct.name}</span>
            </div>
          }
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="aspect-16/9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              {selectedProduct.image_url || selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.image_url || selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🛍️
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={getCategoryBadgeVariant(selectedProduct.category)} size="md">
                  {selectedProduct.category}
                </Badge>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  ${selectedProduct.price.toLocaleString('es-CO')}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Descripción</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedProduct.description || 'Producto disponible para compra directa en nuestra sede o despacho a domicilio.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <div><strong>SKU:</strong> {selectedProduct.sku}</div>
                <div><strong>Disponibilidad:</strong> En tienda física & online</div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setSelectedProduct(null)}
              >
                Entendido
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
