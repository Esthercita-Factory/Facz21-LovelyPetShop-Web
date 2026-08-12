document.addEventListener('DOMContentLoaded', () => {
    // State
    let owners = [];
    let pets = [];
    let stats = null;

    const API_BASE = '/api';

    // UI Elements
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Modals
    const petModal = document.getElementById('pet-modal');
    const ownerModal = document.getElementById('owner-modal');

    // Forms
    const petForm = document.getElementById('pet-form');
    const ownerForm = document.getElementById('owner-form');
    const combinedForm = document.getElementById('combined-registration-form');

    // Tab Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            navButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            if (targetTab === 'dashboard-tab') loadDashboard();
            if (targetTab === 'pets-tab') loadPets();
            if (targetTab === 'owners-tab') loadOwners();
        });
    });

    // Toast Notifications
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${type === 'success' ? '✅' : '❌'}</span>
            <div>${message}</div>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // Species Emoji Helper
    function getSpeciesEmoji(species) {
        if (!species) return '🐾';
        const s = species.toLowerCase();
        if (s.includes('perro') || s.includes('dog')) return '🐶';
        if (s.includes('gato') || s.includes('cat')) return '🐱';
        if (s.includes('conejo') || s.includes('rabbit')) return '🐰';
        if (s.includes('ave') || s.includes('bird') || s.includes('loro')) return '🦜';
        if (s.includes('pez') || s.includes('fish')) return '🐠';
        return '🐾';
    }

    function getSpeciesBadgeClass(species) {
        if (!species) return 'badge-otro';
        const s = species.toLowerCase();
        if (s.includes('perro') || s.includes('dog')) return 'badge-perro';
        if (s.includes('gato') || s.includes('cat')) return 'badge-gato';
        if (s.includes('conejo') || s.includes('rabbit')) return 'badge-conejo';
        if (s.includes('ave') || s.includes('bird')) return 'badge-ave';
        return 'badge-otro';
    }

    // Fetch API Helper
    async function apiFetch(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json', ...options.headers },
                ...options
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición al servidor.');
            }
            return data;
        } catch (err) {
            showToast(err.message, 'error');
            throw err;
        }
    }

    // Load Dashboard Data
    async function loadDashboard() {
        try {
            stats = await apiFetch(`${API_BASE}/stats`);
            document.getElementById('stat-total-pets').textContent = stats.totalPets;
            document.getElementById('stat-total-owners').textContent = stats.totalOwners;

            // Top species
            const speciesKeys = Object.keys(stats.speciesDistribution);
            if (speciesKeys.length > 0) {
                const topSpecies = speciesKeys.reduce((a, b) => stats.speciesDistribution[a] > stats.speciesDistribution[b] ? a : b);
                document.getElementById('stat-top-species').textContent = `${getSpeciesEmoji(topSpecies)} ${topSpecies}`;
                document.getElementById('stat-top-species-count').textContent = `${stats.speciesDistribution[topSpecies]} paciente(s)`;
            } else {
                document.getElementById('stat-top-species').textContent = '-';
            }

            document.getElementById('stat-avg-metrics').textContent = `${stats.averageAge}a / ${stats.averageWeight}kg`;

            // Species chart
            const chartContainer = document.getElementById('species-chart');
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

            // Recent pets list
            const recentContainer = document.getElementById('recent-pets-list');
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

    // Load Pets
    async function loadPets() {
        try {
            pets = await apiFetch(`${API_BASE}/pets`);
            renderPets();
        } catch (e) {
            console.error('Error loading pets:', e);
        }
    }

    function renderPets() {
        const container = document.getElementById('pets-grid-container');
        container.innerHTML = '';

        const searchTerm = document.getElementById('pet-search-input').value.toLowerCase().trim();
        const speciesFilter = document.getElementById('pet-species-filter').value;

        const filtered = pets.filter(p => {
            const matchesSearch = !searchTerm ||
                p.name.toLowerCase().includes(searchTerm) ||
                p.breed.toLowerCase().includes(searchTerm) ||
                p.ownerDocumentNumber.toLowerCase().includes(searchTerm);
            const matchesSpecies = !speciesFilter || p.species.toLowerCase() === speciesFilter.toLowerCase();
            return matchesSearch && matchesSpecies;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    🐾 No se encontraron mascotas que coincidan con la búsqueda.
                </div>`;
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'pet-card';
            card.innerHTML = `
                <div>
                    <div class="card-top-row">
                        <div class="pet-title-block">
                            <div class="pet-emoji-avatar">${getSpeciesEmoji(p.species)}</div>
                            <div>
                                <h4>${p.name}</h4>
                                <span class="breed-text">${p.breed}</span>
                            </div>
                        </div>
                        <span class="badge ${getSpeciesBadgeClass(p.species)}">${p.species}</span>
                    </div>

                    <div class="details-list">
                        <div class="detail-item">🎂 ${p.age} años</div>
                        <div class="detail-item">⚖️ ${p.weight} kg</div>
                        <div class="detail-item">🆔 Doc: ${p.ownerDocumentNumber}</div>
                    </div>

                    <div class="symptoms-box">
                        <strong>Síntomas / Consulta:</strong> ${p.symptoms || 'Ninguno registrado.'}
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm edit-pet-btn" data-uuid="${p.uuid}">✏️ Editar</button>
                    <button class="btn btn-danger btn-sm delete-pet-btn" data-uuid="${p.uuid}" data-name="${p.name}">🗑️ Eliminar</button>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-pet-btn').forEach(b => {
            b.addEventListener('click', () => openEditPetModal(b.getAttribute('data-uuid')));
        });
        document.querySelectorAll('.delete-pet-btn').forEach(b => {
            b.addEventListener('click', () => deletePet(b.getAttribute('data-uuid'), b.getAttribute('data-name')));
        });
    }

    // Load Owners
    async function loadOwners() {
        try {
            owners = await apiFetch(`${API_BASE}/owners`);
            renderOwners();
        } catch (e) {
            console.error('Error loading owners:', e);
        }
    }

    function renderOwners() {
        const container = document.getElementById('owners-grid-container');
        container.innerHTML = '';

        const searchTerm = document.getElementById('owner-search-input').value.toLowerCase().trim();

        const filtered = owners.filter(o => {
            return !searchTerm ||
                o.name.toLowerCase().includes(searchTerm) ||
                o.documentNumber.toLowerCase().includes(searchTerm) ||
                o.phone.toLowerCase().includes(searchTerm);
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    👤 No se encontraron propietarios registrados.
                </div>`;
            return;
        }

        filtered.forEach(o => {
            const card = document.createElement('div');
            card.className = 'owner-card';
            card.innerHTML = `
                <div>
                    <div class="card-top-row">
                        <div class="owner-title-block">
                            <div class="pet-emoji-avatar" style="background: rgba(6, 182, 212, 0.15)">👤</div>
                            <div>
                                <h4>${o.name}</h4>
                                <span class="doc-text">${o.documentType}: ${o.documentNumber}</span>
                            </div>
                        </div>
                        <span class="badge badge-otro">${o.pets.length} mascota(s)</span>
                    </div>

                    <div class="details-list">
                        <div class="detail-item">📞 ${o.phone}</div>
                        <div class="detail-item">✉️ ${o.email || 'N/A'}</div>
                        <div class="detail-item">🏠 ${o.address || 'N/A'}</div>
                    </div>

                    <div style="margin: 0.8rem 0; font-size: 0.85rem;">
                        <strong style="color: var(--text-muted);">Mascotas:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem;">
                            ${o.pets.length > 0 
                                ? o.pets.map(p => `<span class="badge ${getSpeciesBadgeClass(p.species)}">${getSpeciesEmoji(p.species)} ${p.name} (${p.breed})</span>`).join('') 
                                : '<span style="color: var(--text-dim);">Sin mascotas asociadas</span>'}
                        </div>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm edit-owner-btn" data-doc="${o.documentNumber}">✏️ Editar</button>
                    <button class="btn btn-danger btn-sm delete-owner-btn" data-doc="${o.documentNumber}" data-name="${o.name}">🗑️ Eliminar</button>
                </div>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.edit-owner-btn').forEach(b => {
            b.addEventListener('click', () => openEditOwnerModal(b.getAttribute('data-doc')));
        });
        document.querySelectorAll('.delete-owner-btn').forEach(b => {
            b.addEventListener('click', () => deleteOwner(b.getAttribute('data-doc'), b.getAttribute('data-name')));
        });
    }

    // Modal Helpers
    async function populateOwnerDropdown(selectId, selectedDoc = '') {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Cargando...</option>';
        try {
            const list = await apiFetch(`${API_BASE}/owners`);
            select.innerHTML = '<option value="">-- Seleccionar Propietario --</option>';
            list.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.documentNumber;
                opt.textContent = `${o.name} (${o.documentType} ${o.documentNumber})`;
                if (o.documentNumber === selectedDoc) opt.selected = true;
                select.appendChild(opt);
            });
        } catch (e) {
            select.innerHTML = '<option value="">Error cargando propietarios</option>';
        }
    }

    function openModal(modal) {
        modal.classList.add('active');
    }
    function closeModal(modal) {
        modal.classList.remove('active');
    }

    // Pet Modal Open
    document.getElementById('open-add-pet-modal-btn').addEventListener('click', async () => {
        document.getElementById('pet-modal-title').textContent = 'Registrar Nueva Mascota';
        document.getElementById('pet-form').reset();
        document.getElementById('pet-uuid-input').value = '';
        await populateOwnerDropdown('pet-owner-doc');
        openModal(petModal);
    });

    function openEditPetModal(uuid) {
        const pet = pets.find(p => p.uuid === uuid);
        if (!pet) return;
        document.getElementById('pet-modal-title').textContent = 'Editar Mascota';
        document.getElementById('pet-uuid-input').value = pet.uuid;
        document.getElementById('pet-name').value = pet.name;
        document.getElementById('pet-species').value = pet.species;
        document.getElementById('pet-breed').value = pet.breed;
        document.getElementById('pet-age').value = pet.age;
        document.getElementById('pet-weight').value = pet.weight;
        document.getElementById('pet-symptoms').value = pet.symptoms;

        populateOwnerDropdown('pet-owner-doc', pet.ownerDocumentNumber);
        openModal(petModal);
    }

    document.getElementById('close-pet-modal').addEventListener('click', () => closeModal(petModal));
    document.getElementById('cancel-pet-btn').addEventListener('click', () => closeModal(petModal));

    // Pet Form Submit (Create / Update)
    petForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const uuid = document.getElementById('pet-uuid-input').value;
        const body = {
            name: document.getElementById('pet-name').value,
            species: document.getElementById('pet-species').value,
            breed: document.getElementById('pet-breed').value,
            age: parseInt(document.getElementById('pet-age').value),
            weight: parseFloat(document.getElementById('pet-weight').value),
            symptoms: document.getElementById('pet-symptoms').value,
            ownerDocumentNumber: document.getElementById('pet-owner-doc').value
        };

        try {
            if (uuid) {
                await apiFetch(`${API_BASE}/pets/${uuid}`, { method: 'PUT', body: JSON.stringify(body) });
                showToast('Mascota actualizada con éxito.');
            } else {
                await apiFetch(`${API_BASE}/pets`, { method: 'POST', body: JSON.stringify(body) });
                showToast('Mascota registrada exitosamente.');
            }
            closeModal(petModal);
            loadPets();
            loadDashboard();
        } catch (e) {}
    });

    // Delete Pet
    async function deletePet(uuid, name) {
        if (!confirm(`¿Está seguro de eliminar la mascota '${name}'?`)) return;
        try {
            await apiFetch(`${API_BASE}/pets/${uuid}`, { method: 'DELETE' });
            showToast(`Mascota '${name}' eliminada con éxito.`);
            loadPets();
            loadDashboard();
        } catch (e) {}
    }

    // Owner Modal Open
    document.getElementById('open-add-owner-modal-btn').addEventListener('click', () => {
        document.getElementById('owner-modal-title').textContent = 'Registrar Nuevo Propietario';
        document.getElementById('owner-form').reset();
        document.getElementById('owner-original-doc').value = '';
        openModal(ownerModal);
    });

    function openEditOwnerModal(docNumber) {
        const owner = owners.find(o => o.documentNumber === docNumber);
        if (!owner) return;
        document.getElementById('owner-modal-title').textContent = 'Editar Propietario';
        document.getElementById('owner-original-doc').value = owner.documentNumber;
        document.getElementById('owner-doc-type').value = owner.documentType;
        document.getElementById('owner-doc-num').value = owner.documentNumber;
        document.getElementById('owner-name').value = owner.name;
        document.getElementById('owner-phone').value = owner.phone;
        document.getElementById('owner-email').value = owner.email;
        document.getElementById('owner-address').value = owner.address;

        openModal(ownerModal);
    }

    document.getElementById('close-owner-modal').addEventListener('click', () => closeModal(ownerModal));
    document.getElementById('cancel-owner-btn').addEventListener('click', () => closeModal(ownerModal));

    // Owner Form Submit
    ownerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const origDoc = document.getElementById('owner-original-doc').value;
        const docType = document.getElementById('owner-doc-type').value;
        const docNum = document.getElementById('owner-doc-num').value;
        const name = document.getElementById('owner-name').value;
        const phone = document.getElementById('owner-phone').value;
        const email = document.getElementById('owner-email').value;
        const address = document.getElementById('owner-address').value;

        try {
            if (origDoc) {
                const body = {
                    newDocumentType: docType,
                    newDocumentNumber: docNum,
                    name, phone, email, address
                };
                await apiFetch(`${API_BASE}/owners/${origDoc}`, { method: 'PUT', body: JSON.stringify(body) });
                showToast('Propietario actualizado exitosamente.');
            } else {
                const body = { documentType: docType, documentNumber: docNum, name, phone, email, address };
                await apiFetch(`${API_BASE}/owners`, { method: 'POST', body: JSON.stringify(body) });
                showToast('Propietario registrado con éxito.');
            }
            closeModal(ownerModal);
            loadOwners();
            loadDashboard();
        } catch (e) {}
    });

    // Delete Owner
    async function deleteOwner(docNumber, name) {
        if (!confirm(`¿Está seguro de eliminar al propietario '${name}'?`)) return;
        try {
            await apiFetch(`${API_BASE}/owners/${docNumber}`, { method: 'DELETE' });
            showToast(`Propietario '${name}' eliminado con éxito.`);
            loadOwners();
            loadDashboard();
        } catch (e) {}
    }

    // Combined Registration Form Submit
    combinedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            docType: document.getElementById('comb-doc-type').value,
            docNumber: document.getElementById('comb-doc-num').value,
            ownerName: document.getElementById('comb-owner-name').value,
            ownerPhone: document.getElementById('comb-owner-phone').value,
            ownerEmail: document.getElementById('comb-owner-email').value,
            ownerAddress: document.getElementById('comb-owner-address').value,
            petName: document.getElementById('comb-pet-name').value,
            species: document.getElementById('comb-pet-species').value,
            breed: document.getElementById('comb-pet-breed').value,
            age: parseInt(document.getElementById('comb-pet-age').value),
            weight: parseFloat(document.getElementById('comb-pet-weight').value),
            symptoms: document.getElementById('comb-pet-symptoms').value
        };

        try {
            const res = await apiFetch(`${API_BASE}/pets/with-owner`, { method: 'POST', body: JSON.stringify(body) });
            showToast('¡Registro conjunto completado exitosamente!');
            combinedForm.reset();
            loadDashboard();
        } catch (e) {}
    });

    // Search and Filter Listeners
    document.getElementById('pet-search-input').addEventListener('input', renderPets);
    document.getElementById('pet-species-filter').addEventListener('change', renderPets);
    document.getElementById('owner-search-input').addEventListener('input', renderOwners);
    document.getElementById('refresh-dashboard-btn').addEventListener('click', loadDashboard);

    // Initial Load
    loadDashboard();
});
