import { API_BASE, apiFetch } from '../services/api.js';
import { getSpeciesEmoji, getSpeciesBadgeClass } from './ui.js';

let stats = null;

export async function loadDashboard() {
    try {
        stats = await apiFetch(`${API_BASE}/stats`);
        document.getElementById('stat-total-pets').textContent = stats.totalPets;
        document.getElementById('stat-total-owners').textContent = stats.totalOwners;

        const speciesKeys = Object.keys(stats.speciesDistribution);
        if (speciesKeys.length > 0) {
            const topSpecies = speciesKeys.reduce((a, b) => stats.speciesDistribution[a] > stats.speciesDistribution[b] ? a : b);
            document.getElementById('stat-top-species').textContent = `${getSpeciesEmoji(topSpecies)} ${topSpecies}`;
            document.getElementById('stat-top-species-count').textContent = `${stats.speciesDistribution[topSpecies]} paciente(s)`;
        } else {
            document.getElementById('stat-top-species').textContent = '-';
            document.getElementById('stat-top-species-count').textContent = '';
        }

        document.getElementById('stat-avg-metrics').textContent = `${stats.averageAge}a / ${stats.averageWeight}kg`;

        const chartContainer = document.getElementById('species-chart');
        if(chartContainer) {
            chartContainer.innerHTML = '';
            const total = stats.totalPets || 1;
            speciesKeys.forEach(sp => {
                const count = stats.speciesDistribution[sp];
                const pct = Math.round((count / total) * 100);
                const barItem = document.createElement('div');
                barItem.className = 'species-bar-item';
                barItem.innerHTML = `
                    <div class="species-bar-label">
                        <span>${getSpeciesEmoji(sp)} ${sp}</span>
                        <span>${count} (${pct}%)</span>
                    </div>
                    <div class="species-bar-track">
                        <div class="species-bar-fill" style="width: ${pct}%; background: ${getBarColor(sp)}"></div>
                    </div>
                `;
                chartContainer.appendChild(barItem);
            });
        }

        const recentContainer = document.getElementById('recent-pets-list');
        if(recentContainer) {
            recentContainer.innerHTML = '';
            if (stats.recentPets && stats.recentPets.length > 0) {
                stats.recentPets.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'recent-item';
                    item.innerHTML = `
                        <div class="recent-item-info">
                            <div class="recent-avatar">${getSpeciesEmoji(p.species)}</div>
                            <div>
                                <strong>${p.name}</strong> <span class="breed-text">(${p.breed})</span>
                                <div style="font-size: 0.78rem; color: var(--text-muted)">Doc Dueño: ${p.ownerDocumentNumber}</div>
                            </div>
                        </div>
                        <span class="badge ${getSpeciesBadgeClass(p.species)}">${p.species}</span>
                    `;
                    recentContainer.appendChild(item);
                });
            } else {
                recentContainer.innerHTML = '<div style="color: var(--text-muted); padding: 1rem;">No hay registros recientes.</div>';
            }
        }
    } catch (e) {
        console.error('Error loading dashboard:', e);
    }
}

function getBarColor(species) {
    const s = species.toLowerCase();
    if (s.includes('perro')) return '#6366f1';
    if (s.includes('gato')) return '#ec4899';
    if (s.includes('conejo')) return '#f59e0b';
    if (s.includes('ave')) return '#06b6d4';
    return '#10b981';
}

export function setupDashboardEvents() {
    const refreshBtn = document.getElementById('refresh-dashboard-btn');
    if(refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboard);
    }
}
