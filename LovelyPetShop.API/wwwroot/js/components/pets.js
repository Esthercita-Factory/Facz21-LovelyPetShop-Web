import { API_BASE, apiFetch } from '../services/api.js';
import { getSpeciesEmoji, getSpeciesBadgeClass, openModal, closeModal, showToast } from './ui.js';
import { loadDashboard } from './dashboard.js';
import { populateOwnerDropdown } from './owners.js';
import { openMedicalHistory } from './medical_records.js';

export let pets = [];
const petModal = document.getElementById('pet-modal');
const petForm = document.getElementById('pet-form');

export async function loadPets() {
    try {
        pets = await apiFetch(`${API_BASE}/pets`);
        renderPets();
    } catch (e) {
        console.error('Error loading pets:', e);
    }
}

export function renderPets() {
    const container = document.getElementById('pets-grid-container');
    if(!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('pet-search-input');
    const filterInput = document.getElementById('pet-species-filter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const speciesFilter = filterInput ? filterInput.value : '';

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

            <div class="card-actions" style="flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm mh-pet-btn w-100" style="margin-bottom: 0.5rem; border-color: var(--primary); color: #818cf8;" data-uuid="${p.uuid}" data-name="${p.name}">📝 Historial Médico</button>
                <button class="btn btn-secondary btn-sm edit-pet-btn" style="flex:1;" data-uuid="${p.uuid}">✏️ Editar</button>
                <button class="btn btn-danger btn-sm delete-pet-btn" style="flex:1;" data-uuid="${p.uuid}" data-name="${p.name}">🗑️ Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.edit-pet-btn').forEach(b => {
        b.addEventListener('click', () => openEditPetModal(b.getAttribute('data-uuid')));
    });
    document.querySelectorAll('.delete-pet-btn').forEach(b => {
        b.addEventListener('click', () => deletePet(b.getAttribute('data-uuid'), b.getAttribute('data-name')));
    });
    document.querySelectorAll('.mh-pet-btn').forEach(b => {
        b.addEventListener('click', () => openMedicalHistory(b.getAttribute('data-uuid'), b.getAttribute('data-name')));
    });
}

async function deletePet(uuid, name) {
    if (!confirm(`¿Está seguro de eliminar la mascota '${name}'?`)) return;
    try {
        await apiFetch(`${API_BASE}/pets/${uuid}`, { method: 'DELETE' });
        showToast(`Mascota '${name}' eliminada con éxito.`);
        loadPets();
        loadDashboard();
    } catch (e) {}
}

async function openEditPetModal(uuid) {
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

    await populateOwnerDropdown('pet-owner-doc', pet.ownerDocumentNumber);
    openModal(petModal);
}

export function setupPetsEvents() {
    document.getElementById('pet-search-input')?.addEventListener('input', renderPets);
    document.getElementById('pet-species-filter')?.addEventListener('change', renderPets);
    
    document.getElementById('open-add-pet-modal-btn')?.addEventListener('click', async () => {
        document.getElementById('pet-modal-title').textContent = 'Registrar Nueva Mascota';
        petForm.reset();
        document.getElementById('pet-uuid-input').value = '';
        await populateOwnerDropdown('pet-owner-doc');
        openModal(petModal);
    });

    document.getElementById('close-pet-modal')?.addEventListener('click', () => closeModal(petModal));
    document.getElementById('cancel-pet-btn')?.addEventListener('click', () => closeModal(petModal));

    if(petForm) {
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
    }
}
