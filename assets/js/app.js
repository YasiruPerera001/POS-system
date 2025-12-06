const TAX_RATE_DEFAULT = 0.08;
function read(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch (e) { return fallback } }
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
function seedProducts() {
    if (!read('products', null)) {
        const prods = [
            { id: 'p001', name: 'White Rice 5kg', category: 'Grocery', price: 14.99, img: 'assets/img/rice.jpg' },
            { id: 'p002', name: 'Milk 1L', category: 'Dairy', price: 1.49, img: 'assets/img/milk.jpg' },
            { id: 'p003', name: 'Eggs (12)', category: 'Dairy', price: 2.99, img: 'assets/img/eggs.jpg' },
            { id: 'p004', name: 'Potato 1kg', category: 'Produce', price: 0.99, img: 'assets/img/potato.jpg' },
            { id: 'p005', name: 'Coca-Cola 330ml', category: 'Drinks', price: 0.79, img: 'assets/img/cocacola.jpg' }
        ];
        write('products', prods);
    }
    if (read('taxRate', null) === null) write('taxRate', TAX_RATE_DEFAULT);
    if (read('cart', null) === null) write('cart', []);
    if (read('orders', null) === null) write('orders', []);
}
seedProducts();
const productGrid = document.getElementById('productGrid');
const cartItemsEl = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const taxRateLabel = document.getElementById('taxRateLabel');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearBtn = document.getElementById('clearBtn');
const searchInput = document.getElementById('searchInput');
const categoriesEl = document.getElementById('categories');
const checkoutModal = document.getElementById('checkoutModal');
const modalClose = document.getElementById('modalClose');
const cancelCheckout = document.getElementById('cancelCheckout');
const confirmCheckout = document.getElementById('confirmCheckout');
const checkoutDetails = document.getElementById('checkoutDetails');

function getProducts() { return read('products', []) }
function saveProducts(arr) { write('products', arr) }
function getCart() { return read('cart', []) }
function saveCart(c) { write('cart', c) }
function getOrders() { return read('orders', []) }
function saveOrders(o) { write('orders', o) }
function getTaxRate() { return read('taxRate', TAX_RATE_DEFAULT) }

function renderProducts(list) {
    productGrid.innerHTML = '';
    list.forEach(p => {
        const card = document.createElement('div'); card.className = 'product-card';
        card.innerHTML = `<img src="${p.img || 'assets/img/placeholder.png'}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <div class="meta"><div>$${p.price.toFixed(2)}</div><div><small>${p.category || ''}</small></div></div>
      <button class="addBtn" data-id="${p.id}">Add</button>`;
        productGrid.appendChild(card);
    });
    document.querySelectorAll('.addBtn').forEach(b => b.addEventListener('click', e => { addToCart(e.target.dataset.id, 1); renderCart() }));
}

function renderCategories() {
    const prods = getProducts();
    const cats = Array.from(new Set(prods.map(p => p.category))).sort();
    categoriesEl.innerHTML = '';
    const allBtn = document.createElement('button'); allBtn.textContent = 'All'; allBtn.onclick = () => renderProducts(prods);
    categoriesEl.appendChild(allBtn);
    cats.forEach(c => { const btn = document.createElement('button'); btn.textContent = c; btn.onclick = () => renderProducts(prods.filter(p => p.category === c)); categoriesEl.appendChild(btn) });
}

function addToCart(productId, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) item.qty += qty; else cart.push({ id: productId, qty });
    saveCart(cart);
}

function removeFromCart(productId) {
    saveCart(getCart().filter(i => i.id !== productId));
}

function setQty(productId, qty) {
    const cart = getCart(); const it = cart.find(i => i.id === productId); if (it) it.qty = qty; saveCart(cart);
}

function calculateTotals() {
    const products = getProducts(); const cart = getCart();
    let subtotal = 0;
    cart.forEach(ci => { const p = products.find(x => x.id === ci.id); if (p) subtotal += p.price * ci.qty });
    const taxRate = getTaxRate();
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total, taxRate };
}

function renderCart() {
    const cart = getCart(); const products = getProducts();
    cartItemsEl.innerHTML = '';
    if (!cart.length) { cartItemsEl.innerHTML = '<div style="padding:8px;color:#667085">Cart is empty</div>' }
    cart.forEach(ci => {
        const p = products.find(x => x.id === ci.id); if (!p) return;
        const el = document.createElement('div'); el.className = 'cart-item';
        el.innerHTML = `<div style="max-width:68%">${p.name} <br><small>$${p.price.toFixed(2)} each</small></div>
      <div style="display:flex;align-items:center;gap:8px">
        <input type="number" min="1" value="${ci.qty}" data-id="${ci.id}" class="cart-qty" />
        <div>$${(p.price * ci.qty).toFixed(2)}</div>
        <button class="remove" data-id="${ci.id}" aria-label="Remove">✕</button>
      </div>`;
        cartItemsEl.appendChild(el);
    });
    cartItemsEl.querySelectorAll('.remove').forEach(btn => btn.addEventListener('click', e => { removeFromCart(e.target.dataset.id); renderCart(); updateTotals() }));
    cartItemsEl.querySelectorAll('.cart-qty').forEach(inp => inp.addEventListener('change', e => { const v = Math.max(1, parseInt(e.target.value) || 1); setQty(e.target.dataset.id, v); renderCart(); updateTotals() }));
    updateTotals();
}

function updateTotals() {
    const t = calculateTotals();
    subtotalEl.textContent = t.subtotal.toFixed(2);
    taxEl.textContent = t.tax.toFixed(2);
    totalEl.textContent = t.total.toFixed(2);
    taxRateLabel.textContent = (t.taxRate * 100).toFixed(0) + '%';
}

searchInput.addEventListener('input', e => {
    const q = (e.target.value || '').trim().toLowerCase();
    if (!q) renderProducts(getProducts());
    else renderProducts(getProducts().filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)));
});

checkoutBtn.addEventListener('click', () => {
    const cart = getCart(); if (cart.length === 0) { alert('Cart is empty'); return; }
    const totals = calculateTotals();
    let html = `<div>Items: ${cart.length}</div><div>Subtotal: $${totals.subtotal.toFixed(2)}</div><div>Tax: $${totals.tax.toFixed(2)}</div><div style="margin-top:8px;font-weight:700">Total: $${totals.total.toFixed(2)}</div>`;
    checkoutDetails.innerHTML = html; checkoutModal.classList.remove('hidden'); checkoutModal.setAttribute('aria-hidden', 'false');
});

modalClose.addEventListener('click', () => { checkoutModal.classList.add('hidden'); checkoutModal.setAttribute('aria-hidden', 'true') });
cancelCheckout.addEventListener('click', () => { checkoutModal.classList.add('hidden'); checkoutModal.setAttribute('aria-hidden', 'true') });

confirmCheckout.addEventListener('click', () => {
    const cart = getCart(); if (cart.length === 0) { alert('Cart is empty'); checkoutModal.classList.add('hidden'); return; }
    const totals = calculateTotals();
    const orders = getOrders();
    const order = { id: 'ORD' + Date.now(), items: cart, totals, createdAt: new Date().toISOString() };
    orders.push(order); saveOrders(orders); saveCart([]); renderCart(); checkoutModal.classList.add('hidden'); renderReceipt(order);
});

function renderReceipt(order) {
    const products = getProducts();
    let html = `<!doctype html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Receipt ${order.id}</title>
                            <style>body{font-family:Arial;padding:18px}h2{margin-bottom:6px}table{width:100%;border-collapse:collapse}td,th{padding:6px;border-bottom:1px solid #eee}</style>
                        </head>
                        <body>`;
    html += `<h2>DailyMart — Receipt</h2><div>Order: ${order.id}</div><div>${new Date(order.createdAt).toLocaleString()}</div><hr>`;
    html += `<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Line</th></tr></thead><tbody>`;
    order.items.forEach(it => { const p = products.find(x => x.id === it.id); html += `<tr><td>${p ? p.name : it.id}</td><td>${it.qty}</td><td>$${(p ? p.price : 0).toFixed(2)}</td><td>$${((p ? p.price : 0) * it.qty).toFixed(2)}</td></tr>` });
    html += `</tbody></table><hr>`;
    html += `<div>Subtotal: $${order.totals.subtotal.toFixed(2)}</div><div>Tax: $${order.totals.tax.toFixed(2)}</div><div style="font-weight:700">Total: $${order.totals.total.toFixed(2)}</div>`;
    html += `<hr><div>Thank you for shopping at DailyMart!</div></body></html>`;
    const w = window.open('', '_blank', 'width=600,height=800'); w.document.write(html); w.document.close(); w.print();
}

clearBtn.addEventListener('click', () => { if (confirm('Clear cart?')) { saveCart([]); renderCart(); updateTotals() } })

function init() { renderCategories(); renderProducts(getProducts()); renderCart(); updateTotals() }
init();
