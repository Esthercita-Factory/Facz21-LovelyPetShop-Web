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
    const s = species.toLowerCase();
    if (s === 'perro') return '<i data-lucide="dog" style="width:24px;height:24px;"></i>';
    if (s === 'gato') return '<i data-lucide="cat" style="width:24px;height:24px;"></i>';
    if (s === 'conejo') return '<i data-lucide="rabbit" style="width:24px;height:24px;"></i>';
    if (s === 'ave') return '<i data-lucide="bird" style="width:24px;height:24px;"></i>';
    return '<i data-lucide="paw-print" style="width:24px;height:24px;"></i>';
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

export function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    
    if (!btn) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        icon.setAttribute('data-lucide', 'sun');
        text.textContent = 'Modo Claro';
    }

    btn.addEventListener('click', () => {
        const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (currentlyDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.setAttribute('data-lucide', 'moon');
            text.textContent = 'Modo Oscuro';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.setAttribute('data-lucide', 'sun');
            text.textContent = 'Modo Claro';
        }
        if (window.lucide) window.lucide.createIcons();
    });
}
