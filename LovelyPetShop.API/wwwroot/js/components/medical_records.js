import { API_BASE, apiFetch } from '../services/api.js';
import { openModal, closeModal, showToast } from './ui.js';

let currentPetUuid = '';
const mhModal = document.getElementById('medical-history-modal');
const mhForm = document.getElementById('mh-form');
const listContainer = document.getElementById('mh-records-list');

export async function openMedicalHistory(petUuid, petName) {
    currentPetUuid = petUuid;
    document.getElementById('mh-pet-name').textContent = petName;
    document.getElementById('mh-pet-uuid').value = petUuid;
    document.getElementById('mh-date').value = new Date().toISOString().split('T')[0];
    
    mhForm.reset();
    document.getElementById('mh-date').value = new Date().toISOString().split('T')[0];
    
    await loadHistoryList(petUuid);
    openModal(mhModal);
}

async function loadHistoryList(petUuid) {
    listContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">Cargando historial...</div>';
    try {
        const allRecords = await apiFetch(`${API_BASE}/medicalrecords`);
        const petRecords = allRecords.filter(r => r.petUuid === petUuid);
        
        petRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (petRecords.length === 0) {
            listContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">No hay registros clínicos previos para este paciente.</div>';
            return;
        }

        listContainer.innerHTML = '';
        petRecords.forEach(r => {
            const dObj = new Date(r.date);
            const nvObj = r.nextVaccineDate ? new Date(r.nextVaccineDate) : null;
            
            const card = document.createElement('div');
            card.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.8rem; font-size: 0.85rem;';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom: 0.4rem;">
                    <strong style="color: var(--primary);">${dObj.toLocaleDateString()}</strong>
                    <span style="color: var(--text-muted);">⚖️ ${r.weight} kg</span>
                </div>
                <div style="margin-bottom:0.3rem;"><strong>Dx:</strong> ${r.diagnosis}</div>
                <div style="color: var(--text-muted); margin-bottom:0.3rem;"><strong>Tratamiento:</strong> ${r.treatment || 'N/A'}</div>
                ${nvObj ? `<div style="color: var(--accent-cyan);">💉 Próxima Vacuna: ${nvObj.toLocaleDateString()}</div>` : ''}
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        listContainer.innerHTML = '<div style="color:var(--danger); font-size:0.85rem;">Error al cargar el historial.</div>';
    }
}

export function setupMedicalRecordsEvents() {
    document.getElementById('close-mh-modal')?.addEventListener('click', () => closeModal(mhModal));
    
    if (mhForm) {
        mhForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const petUuid = document.getElementById('mh-pet-uuid').value;
            const body = {
                petUuid: petUuid,
                date: new Date(document.getElementById('mh-date').value).toISOString(),
                weight: parseFloat(document.getElementById('mh-weight').value || '0'),
                diagnosis: document.getElementById('mh-diagnosis').value,
                treatment: document.getElementById('mh-treatment').value,
                nextVaccineDate: document.getElementById('mh-next-vaccine').value ? new Date(document.getElementById('mh-next-vaccine').value).toISOString() : null
            };

            try {
                await apiFetch(`${API_BASE}/medicalrecords`, { method: 'POST', body: JSON.stringify(body) });
                showToast('Ficha clínica guardada con éxito.');
                mhForm.reset();
                document.getElementById('mh-date').value = new Date().toISOString().split('T')[0];
                await loadHistoryList(petUuid);
            } catch (err) {}
        });
    }
}
