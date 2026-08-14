import { loadDashboard, setupDashboardEvents } from './js/components/dashboard.js';
import { loadPets, setupPetsEvents } from './js/components/pets.js';
import { loadOwners, setupOwnersEvents } from './js/components/owners.js';
import { loadAppointments, setupAppointmentsEvents } from './js/components/appointments.js';
import { loadEmployees, setupEmployeesEvents } from './js/components/employees.js';
import { loadProducts, setupProductsEvents } from './js/components/products.js';
import { setupMedicalRecordsEvents } from './js/components/medical_records.js';
import { API_BASE, apiFetch } from './js/services/api.js';
import { showToast } from './js/components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
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
            if (targetTab === 'appointments-tab') loadAppointments();
            if (targetTab === 'employees-tab') loadEmployees();
            if (targetTab === 'products-tab') loadProducts();
        });
    });

    // Combined Registration Form Submit
    if(combinedForm) {
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
                await apiFetch(`${API_BASE}/pets/with-owner`, { method: 'POST', body: JSON.stringify(body) });
                showToast('¡Registro conjunto completado exitosamente!');
                combinedForm.reset();
                loadDashboard();
            } catch (e) {}
        });
    }

    // Initialize all events
    setupDashboardEvents();
    setupPetsEvents();
    setupOwnersEvents();
    setupAppointmentsEvents();
    setupEmployeesEvents();
    setupProductsEvents();
    setupMedicalRecordsEvents();

    // Initial Load
    loadDashboard();
});
