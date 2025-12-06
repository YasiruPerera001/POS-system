function read(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch (e) { return fallback } }
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
const ordersList = document.getElementById('ordersList');

function renderOrders() {
    const orders = read('orders', []) || [];
    if (!orders.length) { ordersList.innerHTML = '<div style="padding:12px;color:#667085">No orders yet</div>'; return }
    ordersList.innerHTML = '';
    orders.slice().reverse().forEach(o => {
        const div = document.createElement('div'); div.className = 'order-card'; div.style.padding = '12px'; div.style.borderBottom = '1px solid #eee';
        let html = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>Order ${o.id}</strong><div style="font-size:12px;color:#6b7280">${new Date(o.createdAt).toLocaleString()}</div></div>
      <div><button class="btn primary print-btn" data-id="${o.id}">Print</button></div></div><div style="margin-top:8px">`;
        html += `<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th>Line</th></tr></thead><tbody>`;
        const products = read('products', []);
        o.items.forEach(it => { const p = products.find(x => x.id === it.id); html += `<tr><td>${p ? p.name : it.id}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">$${(p ? p.price : 0 * it.qty).toFixed(2)}</td></tr>` });
        html += `</tbody></table><div style="margin-top:8px;text-align:right"><strong>Total: $${o.totals.total.toFixed(2)}</strong></div>`;
        html += `</div>`;
        div.innerHTML = html;
        ordersList.appendChild(div);
    });
    ordersList.querySelectorAll('.print-btn').forEach(b => b.addEventListener('click', e => printOrder(e.target.dataset.id)));
}

function printOrder(id) {
    const orders = read('orders', []); const order = orders.find(o => o.id == id); if (!order) { alert('Order not found'); return }
    const products = read('products', []);
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Order ${order.id}</title><style>body{font-family:Arial;padding:18px}table{width:100%;border-collapse:collapse}td,th{padding:6px;border-bottom:1px solid #eee}</style></head><body>`;
    html += `<h2>DailyMart — Order ${order.id}</h2><div>${new Date(order.createdAt).toLocaleString()}</div><hr>`;
    html += `<table><thead><tr><th>Item</th><th>Qty</th><th>Line</th></tr></thead><tbody>`;
    order.items.forEach(it => { const p = products.find(x => x.id === it.id); html += `<tr><td>${p ? p.name : it.id}</td><td>${it.qty}</td><td style="text-align:right">$${((p ? p.price : 0) * it.qty).toFixed(2)}</td></tr>` });
    html += `</tbody></table><hr><div style="text-align:right">Total: $${order.totals.total.toFixed(2)}</div>`;
    html += `</body></html>`;
    const w = window.open('', '_blank', 'width=600,height=800'); w.document.write(html); w.document.close(); w.print();
}

renderOrders();
