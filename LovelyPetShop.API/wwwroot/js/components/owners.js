import { API_BASE, apiFetch } from '../services/api.js';
import { getSpeciesEmoji, getSpeciesBadgeClass, openModal, closeModal, showToast } from './ui.js';
import { loadDashboard } from './dashboard.js';

export let owners = [];
const ownerModal = document.getElementById('owner-modal');
const ownerForm = document.getElementById('owner-form');

export async function loadOwners() {
    try {
        owners = await apiFetch(`${API_BASE}/owners`);
        renderOwners();
    } catch (e) {
        console.error('Error loading owners:', e);
    }
}

export function renderOwners() {
    const container = document.getElementById('owners-grid-container');
    if(!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('owner-search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

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

async function deleteOwner(docNumber, name) {
    if (!confirm(`¿Está seguro de eliminar al propietario '${name}'?`)) return;
    try {
        await apiFetch(`${API_BASE}/owners/${docNumber}`, { method: 'DELETE' });
        showToast(`Propietario '${name}' eliminado con éxito.`);
        loadOwners();
        loadDashboard();
    } catch (e) {}
}

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

export async function populateOwnerDropdown(selectId, selectedDoc = '') {
    const select = document.getElementById(selectId);
    if(!select) return;
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

export function setupOwnersEvents() {
    document.getElementById('owner-search-input')?.addEventListener('input', renderOwners);
    
    document.getElementById('open-add-owner-modal-btn')?.addEventListener('click', () => {
        document.getElementById('owner-modal-title').textContent = 'Registrar Nuevo Propietario';
        ownerForm.reset();
        document.getElementById('owner-original-doc').value = '';
        openModal(ownerModal);
    });

    document.getElementById('close-owner-modal')?.addEventListener('click', () => closeModal(ownerModal));
    document.getElementById('cancel-owner-btn')?.addEventListener('click', () => closeModal(ownerModal));

    if(ownerForm) {
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
                    const body = { newDocumentType: docType, newDocumentNumber: docNum, name, phone, email, address };
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
    }
}
