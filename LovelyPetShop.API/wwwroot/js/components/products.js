import { API_BASE, apiFetch } from '../services/api.js';
import { openModal, closeModal, showToast } from './ui.js';

export let products = [];
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

export async function loadProducts() {
    try {
        products = await apiFetch(`${API_BASE}/products`);
        renderProducts();
    } catch (e) {
        console.error('Error loading products:', e);
    }
}

export function renderProducts() {
    const container = document.getElementById('products-grid-container');
    if(!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('product-search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = products.filter(p => {
        return !searchTerm ||
            p.name.toLowerCase().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                📦 No se encontraron productos registrados en el inventario.
            </div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pet-card'; // Reuse the pet-card styles for layout
        
        let stockColor = 'badge-ave'; // cyan
        let stockLabel = 'Stock OK';
        if (p.stockQuantity <= 0) {
            stockColor = 'badge-danger';
            stockLabel = 'Sin Stock';
        } else if (p.stockQuantity <= 5) {
            stockColor = 'badge-conejo'; // amber/orange
            stockLabel = 'Stock Bajo';
        }

        let catEmoji = '📦';
        if(p.category === 'Medicamento' || p.category === 'Vacuna') catEmoji = '💊';
        if(p.category === 'Alimento') catEmoji = '🦴';
        if(p.category === 'Higiene') catEmoji = '🧼';

        card.innerHTML = `
            <div>
                <div class="card-top-row">
                    <div class="pet-title-block">
                        <div class="pet-emoji-avatar" style="background: rgba(245, 158, 11, 0.15)">${catEmoji}</div>
                        <div>
                            <h4>${p.name}</h4>
                            <span class="breed-text">${p.category} | SKU: ${p.sku}</span>
                        </div>
                    </div>
                    <span class="badge badge-otro">$${p.price.toFixed(2)}</span>
                </div>

                <div class="details-list" style="margin-top: 1.5rem;">
                    <div class="detail-item">📦 Stock: <strong>${p.stockQuantity}</strong></div>
                    <div class="detail-item">🏢 Prov: ${p.supplier || 'N/A'}</div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <span class="badge ${stockColor}" style="border:none;">${stockLabel}</span>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn btn-secondary btn-sm edit-prod-btn" data-uuid="${p.uuid}">✏️ Editar</button>
                <button class="btn btn-danger btn-sm delete-prod-btn" data-uuid="${p.uuid}" data-name="${p.name}">🗑️ Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.edit-prod-btn').forEach(b => {
        b.addEventListener('click', () => openEditProductModal(b.getAttribute('data-uuid')));
    });
    document.querySelectorAll('.delete-prod-btn').forEach(b => {
        b.addEventListener('click', () => deleteProduct(b.getAttribute('data-uuid'), b.getAttribute('data-name')));
    });
}

async function deleteProduct(uuid, name) {
    if (!confirm(`¿Está seguro de eliminar el producto '${name}'?`)) return;
    try {
        await apiFetch(`${API_BASE}/products/${uuid}`, { method: 'DELETE' });
        showToast(`Producto '${name}' eliminado con éxito.`);
        loadProducts();
    } catch (e) {}
}

function openEditProductModal(uuid) {
    const p = products.find(prod => prod.uuid === uuid);
    if (!p) return;
    document.getElementById('product-modal-title').textContent = 'Editar Producto';
    document.getElementById('product-uuid').value = p.uuid;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-sku').value = p.sku;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-supplier').value = p.supplier;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-stock').value = p.stockQuantity;

    openModal(productModal);
}

export function setupProductsEvents() {
    document.getElementById('product-search-input')?.addEventListener('input', renderProducts);
    
    document.getElementById('open-add-product-btn')?.addEventListener('click', () => {
        document.getElementById('product-modal-title').textContent = 'Registrar Nuevo Producto';
        productForm.reset();
        document.getElementById('product-uuid').value = '';
        openModal(productModal);
    });

    document.getElementById('close-product-modal')?.addEventListener('click', () => closeModal(productModal));
    document.getElementById('cancel-product-btn')?.addEventListener('click', () => closeModal(productModal));

    if(productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const uuid = document.getElementById('product-uuid').value;
            const body = {
                name: document.getElementById('prod-name').value,
                sku: document.getElementById('prod-sku').value,
                category: document.getElementById('prod-category').value,
                supplier: document.getElementById('prod-supplier').value,
                price: parseFloat(document.getElementById('prod-price').value),
                stockQuantity: parseInt(document.getElementById('prod-stock').value, 10)
            };

            try {
                if (uuid) {
                    await apiFetch(`${API_BASE}/products/${uuid}`, { method: 'PUT', body: JSON.stringify(body) });
                    showToast('Producto actualizado exitosamente.');
                } else {
                    await apiFetch(`${API_BASE}/products`, { method: 'POST', body: JSON.stringify(body) });
                    showToast('Producto registrado con éxito.');
                }
                closeModal(productModal);
                loadProducts();
            } catch (e) {}
        });
    }
}
