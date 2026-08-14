import { API_BASE, apiFetch } from '../services/api.js';
import { openModal, closeModal, showToast } from './ui.js';

export let employees = [];
const employeeModal = document.getElementById('employee-modal');
const employeeForm = document.getElementById('employee-form');

export async function loadEmployees() {
    try {
        employees = await apiFetch(`${API_BASE}/employees`);
        renderEmployees();
    } catch (e) {
        console.error('Error loading employees:', e);
    }
}

export function renderEmployees() {
    const container = document.getElementById('employees-grid-container');
    if(!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('employee-search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = employees.filter(e => {
        return !searchTerm ||
            e.name.toLowerCase().includes(searchTerm) ||
            e.documentNumber.toLowerCase().includes(searchTerm) ||
            e.specialty.toLowerCase().includes(searchTerm) ||
            e.role.toLowerCase().includes(searchTerm);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                🩺 No se encontraron empleados registrados.
            </div>`;
        return;
    }

    filtered.forEach(e => {
        const card = document.createElement('div');
        card.className = 'owner-card'; // Reuse the owner-card styles
        card.innerHTML = `
            <div>
                <div class="card-top-row">
                    <div class="owner-title-block">
                        <div class="pet-emoji-avatar" style="background: rgba(16, 185, 129, 0.15)">🩺</div>
                        <div>
                            <h4>${e.name}</h4>
                            <span class="doc-text">${e.role} ${e.specialty ? `- ${e.specialty}` : ''}</span>
                        </div>
                    </div>
                    <span class="badge ${e.isActive ? 'badge-ave' : 'badge-danger'}">${e.isActive ? 'Activo' : 'Inactivo'}</span>
                </div>

                <div class="details-list">
                    <div class="detail-item">🆔 ${e.documentType}: ${e.documentNumber}</div>
                    <div class="detail-item">📞 ${e.phone}</div>
                    <div class="detail-item">✉️ ${e.email}</div>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn btn-secondary btn-sm edit-emp-btn" data-doc="${e.documentNumber}">✏️ Editar</button>
                <button class="btn btn-danger btn-sm delete-emp-btn" data-doc="${e.documentNumber}" data-name="${e.name}">🗑️ Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.edit-emp-btn').forEach(b => {
        b.addEventListener('click', () => openEditEmployeeModal(b.getAttribute('data-doc')));
    });
    document.querySelectorAll('.delete-emp-btn').forEach(b => {
        b.addEventListener('click', () => deleteEmployee(b.getAttribute('data-doc'), b.getAttribute('data-name')));
    });
}

async function deleteEmployee(docNumber, name) {
    if (!confirm(`¿Está seguro de eliminar al empleado '${name}'?`)) return;
    try {
        await apiFetch(`${API_BASE}/employees/${docNumber}`, { method: 'DELETE' });
        showToast(`Empleado '${name}' eliminado con éxito.`);
        loadEmployees();
    } catch (e) {}
}

function openEditEmployeeModal(docNumber) {
    const emp = employees.find(e => e.documentNumber === docNumber);
    if (!emp) return;
    document.getElementById('employee-modal-title').textContent = 'Editar Empleado';
    document.getElementById('employee-original-doc').value = emp.documentNumber;
    document.getElementById('emp-doc-type').value = emp.documentType;
    document.getElementById('emp-doc-num').value = emp.documentNumber;
    document.getElementById('emp-name').value = emp.name;
    document.getElementById('emp-role').value = emp.role;
    document.getElementById('emp-specialty').value = emp.specialty;
    document.getElementById('emp-phone').value = emp.phone;
    document.getElementById('emp-email').value = emp.email;

    openModal(employeeModal);
}

export function setupEmployeesEvents() {
    document.getElementById('employee-search-input')?.addEventListener('input', renderEmployees);
    
    document.getElementById('open-add-employee-btn')?.addEventListener('click', () => {
        document.getElementById('employee-modal-title').textContent = 'Registrar Nuevo Empleado';
        employeeForm.reset();
        document.getElementById('employee-original-doc').value = '';
        openModal(employeeModal);
    });

    document.getElementById('close-employee-modal')?.addEventListener('click', () => closeModal(employeeModal));
    document.getElementById('cancel-employee-btn')?.addEventListener('click', () => closeModal(employeeModal));

    if(employeeForm) {
        employeeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const origDoc = document.getElementById('employee-original-doc').value;
            const docType = document.getElementById('emp-doc-type').value;
            const docNum = document.getElementById('emp-doc-num').value;
            const name = document.getElementById('emp-name').value;
            const role = document.getElementById('emp-role').value;
            const specialty = document.getElementById('emp-specialty').value;
            const phone = document.getElementById('emp-phone').value;
            const email = document.getElementById('emp-email').value;

            try {
                if (origDoc) {
                    const body = { newDocumentType: docType, newDocumentNumber: docNum, name, role, specialty, phone, email, isActive: true };
                    await apiFetch(`${API_BASE}/employees/${origDoc}`, { method: 'PUT', body: JSON.stringify(body) });
                    showToast('Empleado actualizado exitosamente.');
                } else {
                    const body = { documentType: docType, documentNumber: docNum, name, role, specialty, phone, email, isActive: true };
                    await apiFetch(`${API_BASE}/employees`, { method: 'POST', body: JSON.stringify(body) });
                    showToast('Empleado registrado con éxito.');
                }
                closeModal(employeeModal);
                loadEmployees();
            } catch (e) {}
        });
    }
}
