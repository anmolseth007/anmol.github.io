/* Gau Seva Mission — app.js
   Simple product data, cart, checkout simulation.
   Drop into js/app.js
*/

const products = [
  {
    id: 'ghee-gir-500',
    title: 'Gir Cow Ghee - 500g (Glass Jar)',
    price: 499,
    unit: 'jar',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder',
    description: 'Hand-churned ghee from Gir cows — small-batch, golden aroma, pure & traditional.'
  },
  {
    id: 'ghee-sahiwal-1kg',
    title: 'Sahiwal Cow Ghee - 1kg (Glass Jar)',
    price: 899,
    unit: 'jar',
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder',
    description: 'Rich ghee from Sahiwal cows. Ideal for cooking and rituals.'
  },
  {
    id: 'cow-dung-cakes-pack',
    title: 'Cow Dung Cakes (Pack of 10)',
    price: 249,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1582719478179-1f262b4e4b4d?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder',
    description: 'Traditional dried cow-dung cakes. Useful for rural fuel and cultural use.'
  },
  {
    id: 'organic-manure-10kg',
    title: 'Organic Cow Manure - 10kg',
    price: 399,
    unit: 'bag',
    image: 'https://images.unsplash.com/photo-1524592839726-9de5a6b1f2ec?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder',
    description: 'Composted cow manure for gardens and agriculture — gentle, nutrient-rich.'
  },
  {
    id: 'cow-dung-sanitizer',
    title: 'Cow Dung Based Cleaner (500ml)',
    price: 199,
    unit: 'bottle',
    image: 'https://images.unsplash.com/photo-1581574208274-f77f62e28e3b?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder',
    description: 'Natural household cleaner using cow-dung-derived preparations.'
  }
];

// ----------------- Utilities -----------------
const formatINR = (num) => '₹' + Number(num).toLocaleString('en-IN', {maximumFractionDigits:2});

// DOM elements
const productListEl = document.getElementById('product-list');
const cartBtn = document.getElementById('cart-btn');
const cartCountEl = document.getElementById('cart-count');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsEl = document.getElementById('cart-items');
const drawerTotalEl = document.getElementById('drawer-total');
const closeCartBtn = document.getElementById('close-cart');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutSummaryEl = document.getElementById('checkout-summary');
const summaryTotalEl = document.getElementById('summary-total');
const checkoutForm = document.getElementById('checkout-form');
const orderModal = document.getElementById('order-modal');
const orderDetailsEl = document.getElementById('order-details');
const closeModal = document.getElementById('close-modal');
const closeModal2 = document.getElementById('close-modal-2');
const printReceiptBtn = document.getElementById('print-receipt');
const yearSpan = document.getElementById('year');

yearSpan.textContent = new Date().getFullYear();

// Cart stored as { productId: qty }
let cart = JSON.parse(localStorage.getItem('gs_cart') || '{}');

// -------------- Render products --------------
function renderProducts(){
  productListEl.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy">
      <div class="product-info">
        <h4>${escapeHtml(p.title)}</h4>
        <p class="small">${escapeHtml(p.description)}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div>
            <div class="price">${formatINR(p.price)}</div>
            <div class="small">per ${p.unit}</div>
          </div>
          <div class="product-actions">
            <select class="qty-select" data-id="${p.id}">
              ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
            <button class="btn" data-add="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `;
    productListEl.appendChild(card);
  });
}
function escapeHtml(s){ return (s+'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// -------------- Cart functions --------------
function saveCart(){
  localStorage.setItem('gs_cart', JSON.stringify(cart));
  updateCartCount();
  renderCartDrawer();
  renderCheckoutSummary();
}

function updateCartCount(){
  const count = Object.values(cart).reduce((s,q)=>s+q,0);
  cartCountEl.textContent = count;
  // small animation
  cartBtn.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:220});
}

function addToCart(productId, qty=1){
  cart[productId] = (cart[productId] || 0) + Number(qty);
  saveCart();
}

function setCartQty(productId, qty){
  if(qty <= 0) delete cart[productId];
  else cart[productId] = qty;
  saveCart();
}

function clearCart(){
  cart = {};
  saveCart();
}

function getCartItemsDetailed(){
  return Object.entries(cart).map(([id,qty]) => {
    const p = products.find(x => x.id === id);
    if(!p) return null;
    return { ...p, qty };
  }).filter(Boolean);
}

function cartTotal(){
  return getCartItemsDetailed().reduce((s,it) => s + (it.price * it.qty), 0);
}

// -------------- Render cart drawer --------------
function renderCartDrawer(){
  const items = getCartItemsDetailed();
  cartItemsEl.innerHTML = items.length ? items.map(it => `
    <div class="cart-item" data-id="${it.id}">
      <img src="${it.image}" alt="${escapeHtml(it.title)}" />
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${escapeHtml(it.title)}</strong>
          <button class="remove-item" title="Remove" data-remove="${it.id}">✕</button>
        </div>
        <div class="small">${formatINR(it.price)} × ${it.qty} = <strong>${formatINR(it.price * it.qty)}</strong></div>
        <div style="margin-top:6px">
          <label class="small">Qty</label>
          <input class="qty-input" type="number" min="1" value="${it.qty}" data-id="${it.id}" style="width:70px;padding:6px;border-radius:6px;border:1px solid #e6e6e6">
        </div>
      </div>
    </div>
  `).join('') : '<p class="small" style="padding:1rem">Your cart is empty.</p>';

  drawerTotalEl.textContent = formatINR(cartTotal());
  // attach handlers for remove + qty change
  cartItemsEl.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.remove;
      delete cart[id];
      saveCart();
    });
  });
  cartItemsEl.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', () => {
      const id = input.dataset.id;
      const v = Number(input.value) || 1;
      setCartQty(id, v);
    });
  });
}

// -------------- Checkout summary --------------
function renderCheckoutSummary(){
  const items = getCartItemsDetailed();
  if(items.length === 0){
    checkoutSummaryEl.innerHTML = '<p class="small">No items in cart.</p>';
    summaryTotalEl.textContent = formatINR(0);
    return;
  }
  const html = items.map(it => `<div style="display:flex;justify-content:space-between;margin:6px 0"><div>${escapeHtml(it.title)} x ${it.qty}</div><div>${formatINR(it.price * it.qty)}</div></div>`).join('');
  checkoutSummaryEl.innerHTML = html;
  summaryTotalEl.textContent = formatINR(cartTotal());
}

// -------------- Events --------------
document.addEventListener('click', (ev) => {
  const add = ev.target.closest('[data-add]');
  if(add){
    const id = add.dataset.add;
    const sel = add.closest('.product-card').querySelector('.qty-select');
    const qty = sel ? Number(sel.value) : 1;
    addToCart(id, qty);
    // briefly open cart drawer
    openCartDrawer();
    return;
  }
});

cartBtn.addEventListener('click', () => {
  openCartDrawer();
});

closeCartBtn.addEventListener('click', () => {
  closeCartDrawer();
});

clearCartBtn.addEventListener('click', () => {
  if(confirm('Clear cart?')) clearCart();
});

function openCartDrawer(){
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  renderCartDrawer();
}
function closeCartDrawer(){
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

// Place order (simulate)
checkoutForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const items = getCartItemsDetailed();
  if(items.length === 0){
    alert('Your cart is empty. Add products to place an order.');
    return;
  }
  // gather form data
  const form = new FormData(checkoutForm);
  const order = {
    id: 'ORD' + Date.now(),
    date: new Date().toLocaleString('en-IN'),
    customer: {
      name: form.get('name'),
      phone: form.get('phone'),
      email: form.get('email'),
      address: form.get('address'),
      notes: form.get('notes')
    },
    items,
    total: cartTotal()
  };

  // We'll "simulate" saving the order by showing modal and clearing cart.
  showOrderModal(order);
  clearCart();
  checkoutForm.reset();
});

function showOrderModal(order){
  orderModal.setAttribute('aria-hidden', 'false');
  orderDetailsEl.innerHTML = `
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Date:</strong> ${order.date}</p>
    <p><strong>Name:</strong> ${escapeHtml(order.customer.name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(order.customer.phone)}</p>
    <p><strong>Address:</strong> ${escapeHtml(order.customer.address)}</p>
    <hr>
    <div>
      ${order.items.map(it => `<div style="display:flex;justify-content:space-between;margin:6px 0"><div>${escapeHtml(it.title)} x ${it.qty}</div><div>${formatINR(it.price * it.qty)}</div></div>`).join('')}
    </div>
    <hr>
    <p style="text-align:right;font-weight:700">Total: ${formatINR(order.total)}</p>
  `;
  // store the last order in session for printing
  sessionStorage.setItem('lastOrder', JSON.stringify(order));
}

closeModal.addEventListener('click', () => {
  orderModal.setAttribute('aria-hidden', 'true');
});
closeModal2.addEventListener('click', () => {
  orderModal.setAttribute('aria-hidden', 'true');
});

printReceiptBtn.addEventListener('click', () => {
  const last = sessionStorage.getItem('lastOrder');
  if(!last){ alert('No receipt available.'); return; }
  const w = window.open('','_blank','width=700,height=900');
  const order = JSON.parse(last);
  const html = `
    <html><head><title>Receipt ${order.id}</title>
      <style>body{font-family:Arial;padding:20px}h2{color:#6D4C41}</style>
    </head><body>
      <h2>Gau Seva Mission — Receipt</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Date:</strong> ${order.date}</p>
      <p><strong>Name:</strong> ${escapeHtml(order.customer.name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customer.phone)}</p>
      <p><strong>Address:</strong> ${escapeHtml(order.customer.address)}</p>
      <hr />
      ${order.items.map(it => `<div style="display:flex;justify-content:space-between;margin:6px 0;"><div>${escapeHtml(it.title)} x ${it.qty}</div><div>${formatINR(it.price * it.qty)}</div></div>`).join('')}
      <hr/>
      <h3 style="text-align:right">Total: ${formatINR(order.total)}</h3>
      <p>Thanks for supporting Gau Seva Mission. For queries: orders@gausevamission.example</p>
    </body></html>
  `;
  w.document.write(html);
  w.document.close();
  w.print();
});

// initialize page
renderProducts();
renderCartDrawer();
renderCheckoutSummary();
updateCartCount();

// attach qty-select listeners to product cards (delegation handled in click earlier)

// small helper: click outside to close cart drawer
document.addEventListener('click', (e) => {
  const target = e.target;
  if(!cartDrawer.contains(target) && !cartBtn.contains(target)){
    closeCartDrawer();
  }
});

// Safe fallback for older browsers
(function attachProductSelectHandlers(){
  // nothing needed; HTML uses events above
})();
