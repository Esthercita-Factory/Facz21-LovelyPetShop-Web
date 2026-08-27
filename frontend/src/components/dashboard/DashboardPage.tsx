import React, { useState, useEffect } from 'react';
import { StatsSummary } from '../../types';
import { apiFetch } from '../../services/api';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { PawPrint, Users, Star, Scale, RefreshCw, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<StatsSummary>('/stats');
      setStats(data);
    } catch (e) {
      console.error('Error loading stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getSpeciesEmoji = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes('perro')) return '🐶';
    if (s.includes('gato')) return '🐱';
    if (s.includes('conejo')) return '🐰';
    if (s.includes('ave')) return '🦜';
    return '🐾';
  };

  const getSpeciesBadgeVariant = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes('perro')) return 'primary';
    if (s.includes('gato')) return 'pink';
    if (s.includes('conejo')) return 'warning';
    if (s.includes('ave')) return 'info';
    return 'slate';
  };

  const speciesKeys = stats?.speciesDistribution ? Object.keys(stats.speciesDistribution) : [];
  const topSpecies = speciesKeys.length > 0
    ? speciesKeys.reduce((a, b) => stats!.speciesDistribution[a] > stats!.speciesDistribution[b] ? a : b)
    : '-';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Resumen General de la Clínica
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Métricas clave, distribución de especies y actividad clínica reciente.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadStats}
          loading={loading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Actualizar
        </Button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pets */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Mascotas</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.totalPets ?? 0}
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
              Pacientes registrados
            </span>
          </div>
        </div>

        {/* Total Owners */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Propietarios</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.totalOwners ?? 0}
            </h3>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mt-1 inline-block">
              Clientes activos
            </span>
          </div>
        </div>

        {/* Top Species */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Especie Principal</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{topSpecies !== '-' ? getSpeciesEmoji(topSpecies) : ''}</span>
              <span>{topSpecies}</span>
            </h3>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1 inline-block">
              {topSpecies !== '-' && stats?.speciesDistribution[topSpecies]
                ? `${stats.speciesDistribution[topSpecies]} paciente(s)`
                : 'Sin registros'}
            </span>
          </div>
        </div>

        {/* Average Metrics */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Promedio Edad / Peso</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.averageAge ?? 0}a / {stats?.averageWeight ?? 0}kg
            </h3>
            <span className="text-xs text-slate-400 font-semibold mt-1 inline-block">
              Promedio de población
            </span>
          </div>
        </div>
      </div>

      {/* Split Section: Species Distribution & Recent Pets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Species Distribution Chart */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-5">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Distribución por Especie
          </h4>

          {speciesKeys.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No hay datos de distribución.</p>
          ) : (
            <div className="space-y-4">
              {speciesKeys.map(sp => {
                const count = stats!.speciesDistribution[sp];
                const total = stats!.totalPets || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={sp} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                        <span>{getSpeciesEmoji(sp)}</span>
                        <span>{sp}</span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {count} ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Pets Feed */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-5">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Últimas Mascotas Registradas
          </h4>

          {!stats?.recentPets || stats.recentPets.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No hay registros recientes.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPets.map(p => (
                <div
                  key={p.uuid}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-xs shrink-0">
                      {getSpeciesEmoji(p.species)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.name} <span className="text-slate-400 font-normal">({p.breed || p.species})</span>
                      </h5>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Doc Dueño: {p.ownerDocumentNumber || p.owner_document_number || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <Badge variant={getSpeciesBadgeVariant(p.species) as any} size="sm">
                    {p.species}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
