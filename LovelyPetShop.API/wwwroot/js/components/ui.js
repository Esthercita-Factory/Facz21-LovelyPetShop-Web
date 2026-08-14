export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <div>${message}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

export function getSpeciesEmoji(species) {
    if (!species) return '🐾';
    const s = species.toLowerCase();
    if (s.includes('perro') || s.includes('dog')) return '🐶';
    if (s.includes('gato') || s.includes('cat')) return '🐱';
    if (s.includes('conejo') || s.includes('rabbit')) return '🐰';
    if (s.includes('ave') || s.includes('bird') || s.includes('loro')) return '🦜';
    if (s.includes('pez') || s.includes('fish')) return '🐠';
    return '🐾';
}

export function getSpeciesBadgeClass(species) {
    if (!species) return 'badge-otro';
    const s = species.toLowerCase();
    if (s.includes('perro') || s.includes('dog')) return 'badge-perro';
    if (s.includes('gato') || s.includes('cat')) return 'badge-gato';
    if (s.includes('conejo') || s.includes('rabbit')) return 'badge-conejo';
    if (s.includes('ave') || s.includes('bird')) return 'badge-ave';
    return 'badge-otro';
}

export function openModal(modal) {
    if (modal) modal.classList.add('active');
}

export function closeModal(modal) {
    if (modal) modal.classList.remove('active');
}
