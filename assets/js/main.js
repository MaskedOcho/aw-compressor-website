// A&W Compressor & Mechanical Services — shared site behavior

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Dropdown nav groups (Products & Services / Company)
  document.querySelectorAll('.dropdown-toggle').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = btn.closest('.has-dropdown');
      const isOpen = parent.classList.contains('open');
      document.querySelectorAll('.has-dropdown.open').forEach((el) => {
        if (el !== parent) el.classList.remove('open');
      });
      parent.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown.open').forEach((el) => {
        el.classList.remove('open');
        el.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Quote form (no backend wired up — placeholder submit handler)
  const quoteForm = document.querySelector('#quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks! Your request has been received. Our team will follow up shortly.');
      quoteForm.reset();
    });
  }

  initCart();
});

/* ---------------- Cart ---------------- */
const CART_KEY = 'aw_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  renderCartDrawer();
  openCart();
}

function removeFromCart(id) {
  let cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  renderCartDrawer();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    return removeFromCart(id);
  }
  saveCart(cart);
  renderCartDrawer();
}

function cartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartCount() {
  const countEls = document.querySelectorAll('.cart-count');
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  countEls.forEach(el => el.textContent = count);
}

function openCart() {
  document.querySelector('.cart-drawer')?.classList.add('open');
  document.querySelector('.overlay')?.classList.add('open');
}

function closeCart() {
  document.querySelector('.cart-drawer')?.classList.remove('open');
  document.querySelector('.overlay')?.classList.remove('open');
}

function renderCartDrawer() {
  const body = document.querySelector('.cart-drawer-body');
  const foot = document.querySelector('.cart-drawer-foot');
  if (!body) return;
  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Browse the shop to add parts &amp; equipment.</div>';
    if (foot) foot.style.display = 'none';
    return;
  }

  if (foot) foot.style.display = 'block';
  body.innerHTML = cart.map(item => `
    <div class="cart-line">
      <div class="thumb">${item.icon || '⚙'}</div>
      <div class="info">
        <strong>${item.name}</strong>
        <span>$${item.price.toFixed(2)} each</span>
        <div class="qty-control">
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="remove-line" onclick="removeFromCart('${item.id}')" aria-label="Remove">✕</button>
    </div>
  `).join('');

  const totalEl = document.querySelector('#cartTotal');
  if (totalEl) totalEl.textContent = '$' + cartTotal().toFixed(2);
}

function initCart() {
  updateCartCount();
  renderCartDrawer();

  document.querySelectorAll('.cart-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });
  document.querySelector('.cart-drawer-close')?.addEventListener('click', closeCart);
  document.querySelector('.overlay')?.addEventListener('click', closeCart);

  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        icon: btn.dataset.icon || '⚙'
      };
      addToCart(product);
    });
  });

  // Shop filter chips
  const chips = document.querySelectorAll('.filter-chip');
  const products = document.querySelectorAll('.product-card');
  if (chips.length && products.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.dataset.filter;
        products.forEach(card => {
          card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
        });
      });
    });
  }
}
