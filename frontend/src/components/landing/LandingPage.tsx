import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  Sparkles, 
  ShoppingBag, 
  LogIn, 
  ShieldCheck, 
  Stethoscope, 
  Shield, 
  Scissors, 
  Activity, 
  ArrowRight, 
  Clock, 
  MapPin, 
  PhoneCall,
  Check,
  LayoutDashboard,
  PawPrint
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const { user, isAuthenticated, isStaff, isClient } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await apiFetch<Product[]>('/products/catalog');
        setFeaturedProducts(data.slice(0, 4));
      } catch (e) {
        console.error('Error loading featured products:', e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const getStaffDefaultTab = () => {
    if (!user) return 'dashboard';
    if (user.role === 'Admin') return 'dashboard';
    if (user.role === 'Veterinario') return 'pets';
    return 'appointments';
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-indigo-800/40">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Clínica Veterinaria Integral & Tienda de Confianza
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              El mejor cuidado para los que más <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-indigo-300">amas</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Atención médica profesional, citas médicas especializadas, nutrición premium y seguimiento de salud en un solo lugar.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('store')}
                icon={<ShoppingBag className="w-5 h-5" />}
                className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg"
              >
                Explorar Tienda
              </Button>

              {isAuthenticated && user ? (
                isStaff ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => onNavigate(getStaffDefaultTab())}
                    icon={<LayoutDashboard className="w-5 h-5" />}
                    className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md font-bold"
                  >
                    Ir a mi Panel ({user.role})
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => onNavigate('my-pets')}
                    icon={<PawPrint className="w-5 h-5" />}
                    className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md font-bold"
                  >
                    Ver Mis Mascotas
                  </Button>
                )
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => onOpenAuth('login')}
                  icon={<LogIn className="w-5 h-5" />}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                >
                  Acceder al Portal
                </Button>
              )}
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Atención Garantizada</h4>
                  <p className="text-xs text-emerald-300 font-medium">Médicos veterinarios certificados</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10 text-sm text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>🐶 Vacunación y desparasitación al día</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>🐱 Cirugías y laboratorio clínico</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>🩺 Fichas clínicas digitales para clientes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nuestros Servicios
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Especialidades diseñadas para el bienestar integral de tus mascotas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Consulta Médica</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Diagnósticos precisos, control general preventivo y tratamientos individualizados.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Vacunación & Desparasitación</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Esquemas completos para cachorros, adultos y prevención periódica de parásitos.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Scissors className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Peluquería & Spa</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Baños medicados, cortes de raza, corte de uñas y estética profesional.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Cirugías & Laboratorio</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Quirófano equipado para esterilizaciones, cirugías menores y análisis clínicos.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Productos Destacados
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Alimentos premium, medicamentos, accesorios y snacks al mejor precio.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('store')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Ver Todo el Catálogo
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(p => (
              <div key={p.uuid} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-200 group">
                <div className="aspect-4/3 w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden relative">
                  {p.image_url || p.imageUrl ? (
                    <img
                      src={p.image_url || p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🛍️
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant="primary" size="sm">
                      {p.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      ${p.price.toLocaleString('es-CO')}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onNavigate('store')}
                    >
                      Ver en Tienda
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info & Contact Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Horarios de Atención</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Lunes a Sábado: 8:00 AM - 7:00 PM<br />
              Domingos y Festivos: 9:00 AM - 2:00 PM
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Ubicación</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Av. Principal #45-12, Sector Los Laureles<br />
              Parqueadero privado para clientes
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Contacto & Urgencias</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Línea directa: +57 (300) 123-4567<br />
              WhatsApp: +57 (311) 987-6543
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
