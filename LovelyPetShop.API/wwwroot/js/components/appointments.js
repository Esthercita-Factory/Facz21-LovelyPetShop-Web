import { API_BASE, apiFetch } from '../services/api.js';
import { openModal, closeModal, showToast } from './ui.js';

export let appointments = [];
let localPets = [];

const appointmentModal = document.getElementById('appointment-modal');
const appointmentForm = document.getElementById('appointment-form');

export async function loadAppointments() {
    try {
        appointments = await apiFetch(`${API_BASE}/appointments`);
        localPets = await apiFetch(`${API_BASE}/pets`);
        renderAppointments();
    } catch (e) {
        console.error('Error loading appointments:', e);
    }
}

function getPetName(petUuid) {
    const p = localPets.find(x => x.uuid === petUuid);
    return p ? `${p.name} (${p.species})` : 'Mascota Desconocida';
}

function getOwnerForPet(petUuid) {
    const p = localPets.find(x => x.uuid === petUuid);
    return p ? p.ownerDocumentNumber : '';
}

export function renderAppointments() {
    const container = document.getElementById('appointments-grid-container');
    if(!container) return;
    container.innerHTML = '';

    const dateInput = document.getElementById('appointment-date-filter');
    const statusInput = document.getElementById('appointment-status-filter');
    
    const dateFilter = dateInput ? dateInput.value : '';
    const statusFilter = statusInput ? statusInput.value : '';

    const filtered = appointments.filter(a => {
        let matchDate = true;
        if (dateFilter) {
            const appDate = new Date(a.scheduledDate).toISOString().split('T')[0];
            matchDate = (appDate === dateFilter);
        }
        const matchStatus = !statusFilter || a.status === statusFilter;
        return matchDate && matchStatus;
    });

    // Sort by date closest first
    filtered.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                📅 No se encontraron citas para los filtros seleccionados.
            </div>`;
        return;
    }

    filtered.forEach(a => {
        const card = document.createElement('div');
        card.className = 'owner-card'; 

        let statusColor = 'badge-otro';
        if (a.status === 'Programada') statusColor = 'badge-perro'; // purple/indigo
        if (a.status === 'Completada') statusColor = 'badge-ave'; // cyan
        if (a.status === 'Cancelada') statusColor = 'badge-danger';

        const appDate = new Date(a.scheduledDate);
        const dateString = appDate.toLocaleDateString();
        const timeString = appDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        card.innerHTML = `
            <div>
                <div class="card-top-row">
                    <div class="owner-title-block">
                        <div class="pet-emoji-avatar" style="background: rgba(99, 102, 241, 0.15)">📅</div>
                        <div>
                            <h4>${a.serviceType}</h4>
                            <span class="doc-text">${dateString} a las ${timeString}</span>
                        </div>
                    </div>
                    <span class="badge ${statusColor}">${a.status}</span>
                </div>

                <div class="details-list" style="margin-top:1.2rem;">
                    <div class="detail-item">🐾 ${getPetName(a.petUuid)}</div>
                </div>

                <div class="symptoms-box" style="margin-top: 1rem;">
                    <strong>Notas:</strong> ${a.notes || 'Ninguna.'}
                </div>
            </div>

            <div class="card-actions">
                <button class="btn btn-secondary btn-sm edit-app-btn" data-uuid="${a.uuid}">✏️ Editar</button>
                <button class="btn btn-danger btn-sm delete-app-btn" data-uuid="${a.uuid}">🗑️ Cancelar</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.edit-app-btn').forEach(b => {
        b.addEventListener('click', () => openEditAppointmentModal(b.getAttribute('data-uuid')));
    });
    document.querySelectorAll('.delete-app-btn').forEach(b => {
        b.addEventListener('click', () => deleteAppointment(b.getAttribute('data-uuid')));
    });
}

async function deleteAppointment(uuid) {
    if (!confirm(`¿Está seguro de cancelar/eliminar esta cita?`)) return;
    try {
        await apiFetch(`${API_BASE}/appointments/${uuid}`, { method: 'DELETE' });
        showToast(`Cita eliminada con éxito.`);
        loadAppointments();
    } catch (e) {}
}

async function populatePetDropdown(selectId, selectedUuid = '') {
    const select = document.getElementById(selectId);
    if(!select) return;
    select.innerHTML = '<option value="">Cargando mascotas...</option>';
    try {
        localPets = await apiFetch(`${API_BASE}/pets`);
        select.innerHTML = '<option value="">-- Seleccionar Paciente --</option>';
        localPets.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.uuid;
            opt.textContent = `${p.name} (${p.breed} - Dueño Doc: ${p.ownerDocumentNumber})`;
            if (p.uuid === selectedUuid) opt.selected = true;
            select.appendChild(opt);
        });
    } catch (e) {
        select.innerHTML = '<option value="">Error cargando mascotas</option>';
    }
}

async function openEditAppointmentModal(uuid) {
    const a = appointments.find(x => x.uuid === uuid);
    if (!a) return;
    document.getElementById('appointment-modal-title').textContent = 'Editar Cita';
    document.getElementById('appointment-uuid').value = a.uuid;
    
    // Format datetime-local "YYYY-MM-DDThh:mm"
    const dt = new Date(a.scheduledDate);
    const tzOffset = dt.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(dt - tzOffset)).toISOString().slice(0, 16);
    
    document.getElementById('app-date').value = localISOTime;
    document.getElementById('app-service').value = a.serviceType;
    document.getElementById('app-status').value = a.status;
    document.getElementById('app-notes').value = a.notes;
    document.getElementById('app-owner-uuid').value = a.ownerUuid || getOwnerForPet(a.petUuid);

    await populatePetDropdown('app-pet', a.petUuid);
    openModal(appointmentModal);
}

export function setupAppointmentsEvents() {
    document.getElementById('appointment-date-filter')?.addEventListener('change', renderAppointments);
    document.getElementById('appointment-status-filter')?.addEventListener('change', renderAppointments);
    
    document.getElementById('open-add-appointment-btn')?.addEventListener('click', async () => {
        document.getElementById('appointment-modal-title').textContent = 'Agendar Nueva Cita';
        appointmentForm.reset();
        document.getElementById('appointment-uuid').value = '';
        document.getElementById('app-owner-uuid').value = '';
        
        // Default to next hour
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        const tzOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
        document.getElementById('app-date').value = localISOTime;

        await populatePetDropdown('app-pet');
        openModal(appointmentModal);
    });

    document.getElementById('close-appointment-modal')?.addEventListener('click', () => closeModal(appointmentModal));
    document.getElementById('cancel-appointment-btn')?.addEventListener('click', () => closeModal(appointmentModal));

    if(appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const uuid = document.getElementById('appointment-uuid').value;
            const petUuid = document.getElementById('app-pet').value;
            const dateStr = document.getElementById('app-date').value;
            
            // To UTC for backend
            const dateObj = new Date(dateStr);
            
            const body = {
                petUuid: petUuid,
                ownerUuid: getOwnerForPet(petUuid),
                scheduledDate: dateObj.toISOString(),
                serviceType: document.getElementById('app-service').value,
                status: document.getElementById('app-status').value,
                notes: document.getElementById('app-notes').value
            };

            try {
                if (uuid) {
                    await apiFetch(`${API_BASE}/appointments/${uuid}`, { method: 'PUT', body: JSON.stringify(body) });
                    showToast('Cita actualizada exitosamente.');
                } else {
                    await apiFetch(`${API_BASE}/appointments`, { method: 'POST', body: JSON.stringify(body) });
                    showToast('Cita agendada con éxito.');
                }
                closeModal(appointmentModal);
                loadAppointments();
            } catch (e) {}
        });
    }
}
