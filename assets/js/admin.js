function read(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch (e) { return fallback } }
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
let products = read('products', []) || [];
let editIndex = -1;
const pName = document.getElementById('pName');
const pPrice = document.getElementById('pPrice');
const pCategory = document.getElementById('pCategory');
const pImg = document.getElementById('pImg');
const saveProduct = document.getElementById('saveProduct');
const resetForm = document.getElementById('resetForm');
const productTable = document.getElementById('productTable');
const searchProducts = document.getElementById('searchProducts');
const formTitle = document.getElementById('formTitle');

function renderList(list) {
    productTable.innerHTML = '';
    if (!list.length) { productTable.innerHTML = '<tr><td colspan="4">No products</td></tr>'; return }
    list.forEach((p, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.name}</td><td>$${p.price.toFixed(2)}</td><td>${p.category || ''}</td><td>
      <button class="action-btn edit-btn" data-i="${i}">Edit</button>
      <button class="action-btn delete-btn" data-i="${i}">Delete</button>
    </td>`;
        productTable.appendChild(tr);
    });
    productTable.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', e => { const i = parseInt(e.target.dataset.i); startEdit(i) }));
    productTable.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', e => { const i = parseInt(e.target.dataset.i); deleteProduct(i) }));
}

function startEdit(i) {
    editIndex = i;
    const p = products[i];
    pName.value = p.name; pPrice.value = p.price; pCategory.value = p.category || ''; pImg.value = p.img || '';
    formTitle.textContent = 'Edit Product';
}

function deleteProduct(i) {
    if (!confirm('Delete product?')) return;
    products.splice(i, 1);
    write('products', products);
    renderList(products);
}

saveProduct.addEventListener('click', () => {
    const name = pName.value.trim(); const price = parseFloat(pPrice.value); const category = pCategory.value.trim(); const img = pImg.value.trim();
    if (!name || isNaN(price)) { alert('Enter valid name and price'); return }
    if (editIndex === -1) {
        const id = 'p' + Date.now();
        products.push({ id, name, price, category, img });
    } else {
        products[editIndex] = { ...products[editIndex], name, price, category, img };
        editIndex = -1; formTitle.textContent = 'Add Product';
    }
    write('products', products);
    pName.value = ''; pPrice.value = ''; pCategory.value = ''; pImg.value = '';
    renderList(products);
});

resetForm.addEventListener('click', () => { editIndex = -1; formTitle.textContent = 'Add Product'; pName.value = ''; pPrice.value = ''; pCategory.value = ''; pImg.value = ''; })

searchProducts.addEventListener('input', () => { const q = searchProducts.value.toLowerCase(); renderList(products.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q))) })

renderList(products);
