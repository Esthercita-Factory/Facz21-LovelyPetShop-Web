export const API_BASE = '/api';

import { showToast } from '../components/ui.js';

export async function apiFetch(url, options = {}) {
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
