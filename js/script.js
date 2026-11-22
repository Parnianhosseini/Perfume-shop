/* ÉLORA PERFUMES — storefront interactions */
document.addEventListener('DOMContentLoaded', () => {
  const products = {
    'rose-elegance': { name: 'Rose Elegance', price: 65, notes: 'Velvety rose · soft musk · amber', image: 'https://images.pexels.com/photos/14581395/pexels-photo-14581395.jpeg?auto=compress&cs=tinysrgb&w=1000' },
    'golden-oud': { name: 'Golden Oud', price: 85, notes: 'Smoked oud · saffron · warm woods', image: 'https://images.pexels.com/photos/7814956/pexels-photo-7814956.jpeg?auto=compress&cs=tinysrgb&w=1000' },
    'fresh-breeze': { name: 'Fresh Breeze', price: 55, notes: 'Bergamot · green tea · white cedar', image: 'https://images.pexels.com/photos/14311564/pexels-photo-14311564.jpeg?auto=compress&cs=tinysrgb&w=1000' },
    'midnight-bloom': { name: 'Midnight Bloom', price: 75, notes: 'Night jasmine · plum · cashmere woods', image: 'https://images.pexels.com/photos/31007014/pexels-photo-31007014.jpeg?auto=compress&cs=tinysrgb&w=1000' },
    'velvet-amber': { name: 'Velvet Amber', price: 90, notes: 'Golden amber · vanilla · sandalwood', image: 'https://images.pexels.com/photos/19004226/pexels-photo-19004226.jpeg?auto=compress&cs=tinysrgb&w=1000' },
    'pure-essence': { name: 'Pure Essence', price: 60, notes: 'Soft iris · clean musk · skin warmth', image: 'https://images.pexels.com/photos/27357173/pexels-photo-27357173.jpeg?auto=compress&cs=tinysrgb&w=1000' }
  };
  const cart = new Map();
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const payTotal = document.getElementById('payTotal');
  const payNow = document.getElementById('payNow');
  const checkoutStatus = document.getElementById('checkoutStatus');
  const modalItemCount = document.getElementById('modalItemCount');
  const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById('cartToast'), { delay: 2400 });
  const money = (value) => `$${value.toFixed(2)}`;

  function renderCart() {
    const count = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
    const total = [...cart.entries()].reduce((sum, [id, quantity]) => sum + products[id].price * quantity, 0);
    cartCount.textContent = count;
    modalItemCount.textContent = `(${count})`;
    cartTotal.textContent = money(total);
    payTotal.textContent = money(total);
    payNow.disabled = count === 0;

    if (!count) {
      cartItems.innerHTML = '<div class="empty-cart"><i class="bi bi-bag"></i><p>Your bag is waiting for a little something.</p><a href="#shop" data-bs-dismiss="modal">Explore the collection <i class="bi bi-arrow-up-right"></i></a></div>';
      return;
    }

    cartItems.innerHTML = [...cart.entries()].map(([id, quantity]) => {
      const product = products[id];
      return `<article class="cart-row"><img src="${product.image}" alt="${product.name} perfume"><div><h3>${product.name}</h3><p>${product.notes} · Qty ${quantity}</p><button class="remove-item" type="button" data-remove="${id}">Remove</button></div><span class="cart-row-price">${money(product.price * quantity)}</span></article>`;
    }).join('');
  }

  // Add an item to the bag; repeated additions increase its quantity.
  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      if (!products[id]) return;
      cart.set(id, (cart.get(id) || 0) + 1);
      checkoutStatus.textContent = '';
      renderCart();
      document.getElementById('toastMessage').textContent = `${products[id].name} added to your bag.`;
      toast.show();
    });
  });

  cartItems.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove]');
    if (!removeButton) return;
    cart.delete(removeButton.dataset.remove);
    renderCart();
  });

  // Demonstration checkout only: confirm the selected method, then clear the mock order.
  payNow.addEventListener('click', () => {
    if (!cart.size) return;
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const methodName = selectedMethod?.value === 'paypal' ? 'PayPal' : 'card';
    checkoutStatus.textContent = `Demo checkout complete using ${methodName}. No payment was processed.`;
    cart.clear();
    renderCart();
  });

  // Quick view modal uses the same product catalog as the shop and cart.
  const productModalElement = document.getElementById('productModal');
  const productModal = bootstrap.Modal.getOrCreateInstance(productModalElement);
  document.querySelectorAll('.quick-view').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.product;
      const product = products[id];
      if (!product) return;
      document.getElementById('productModalBody').innerHTML = `<div class="detail-product"><img src="${product.image}" alt="${product.name} perfume"><p class="eyebrow">EAU DE PARFUM · 50 ML</p><h2 id="productModalTitle">${product.name}</h2><p>${product.notes}. A thoughtful composition made to linger on the skin and in memory.</p><p><strong>${money(product.price)}</strong></p><button class="btn btn-primary-custom" type="button" data-modal-add="${id}">Add to bag <i class="bi bi-plus-lg"></i></button></div>`;
      productModal.show();
    });
  });
  document.getElementById('productModalBody').addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-modal-add]');
    if (!addButton) return;
    const id = addButton.dataset.modalAdd;
    cart.set(id, (cart.get(id) || 0) + 1);
    checkoutStatus.textContent = '';
    renderCart();
    document.getElementById('toastMessage').textContent = `${products[id].name} added to your bag.`;
    toast.show();
    productModal.hide();
  });

  // Bootstrap handles the hamburger collapse; close it after selecting a section.
  document.querySelectorAll('#siteNav .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      const menu = document.getElementById('siteNav');
      if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });

  // Reveal content on entry and keep the header's current section in sync.
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((target) => revealObserver.observe(target));

    const sections = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  }

  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => backToTop.classList.toggle('is-visible', window.scrollY > 450), { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Image URLs can occasionally fail; retain a calm palette background in that case.
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.style.visibility = 'hidden';
      image.closest('.collection-image, .product-visual, .detail-product, .cart-row')?.classList.add('image-unavailable');
    }, { once: true });
  });

  // Client-side form validation only; no data leaves the browser.
  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('formSuccess');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    successMessage.textContent = '';
    let valid = true;
    form.querySelectorAll('.form-field').forEach((field) => {
      const input = field.querySelector('input, textarea');
      const error = field.querySelector('.field-error');
      const value = input.value.trim();
      let message = '';
      if (!value) message = 'Please complete this field.';
      else if (input.type === 'email' && !emailPattern.test(value)) message = 'Please enter a valid email address.';
      field.classList.toggle('is-invalid', Boolean(message));
      error.textContent = message;
      if (message) valid = false;
    });
    if (!valid) {
      form.querySelector('.is-invalid input, .is-invalid textarea')?.focus();
      return;
    }
    successMessage.textContent = 'Thank you for your message. Our team will be in touch soon.';
    form.reset();
  });
  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      const field = input.closest('.form-field');
      if (input.value.trim()) {
        field.classList.remove('is-invalid');
        field.querySelector('.field-error').textContent = '';
      }
      successMessage.textContent = '';
    });
  });

  renderCart();
});
