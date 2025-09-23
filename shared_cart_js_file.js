// Shared Cart System - Works across all pages
// Cart functionality with session persistence
let cart = [];

// Load cart from sessionStorage on page load
function loadCart() {
  const savedCart = sessionStorage.getItem('bioshield-cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }
}

// Save cart to sessionStorage
function saveCart() {
  sessionStorage.setItem('bioshield-cart', JSON.stringify(cart));
}

// DOM elements
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartSummary = document.getElementById('cartSummary');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartNotification = document.getElementById('cartNotification');

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  updateCartUI();
});

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll(".hidden").forEach((el) => observer.observe(el));

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Cart Modal Functions
function openCartModal() {
  cartModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeCartModal() {
  cartModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Add to cart function
function addToCart(product) {
  const existingItem = cart.find(item => item.name === product.name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
      id: Date.now() + Math.random() // Simple unique ID
    });
  }
  
  saveCart(); // Save to sessionStorage
  updateCartUI();
  showNotification();
}

// Remove from cart function
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart(); // Save to sessionStorage
  updateCartUI();
}

// Update cart UI
function updateCartUI() {
  updateCartCount();
  updateCartItems();
  updateCartTotal();
}

// Update cart count
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
      cartCount.style.display = 'flex';
    } else {
      cartCount.style.display = 'none';
    }
  }
}

// Update cart items display
function updateCartItems() {
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started!</p>
      </div>
    `;
    if (cartSummary) cartSummary.style.display = 'none';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-price">$${item.price}</p>
        </div>
        <div class="cart-item-controls">
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
        </div>
      </div>
    `).join('');
    if (cartSummary) cartSummary.style.display = 'block';
  }
}

// Update quantity
function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart(); // Save to sessionStorage
      updateCartUI();
    }
  }
}

// Update cart total
function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  if (cartTotal) {
    cartTotal.textContent = total.toFixed(2);
  }
}

// Show notification
function showNotification() {
  if (cartNotification) {
    cartNotification.classList.add('show');
    setTimeout(() => {
      cartNotification.classList.remove('show');
    }, 2000);
  }
}

// Clear cart
function clearCart() {
  cart = [];
  saveCart(); // Save to sessionStorage
  updateCartUI();
}

// Checkout function
function checkout() {
  if (cart.length === 0) return;
  
  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  alert(`Checkout total: $${total.toFixed(2)}\n\nThis is a demo. In a real implementation, you would integrate with a payment processor like Stripe, PayPal, or similar.`);
  
  // In a real implementation, you would redirect to a checkout page or open a payment modal
  // For demo purposes, we'll clear the cart
  clearCart();
  closeCartModal();
}

// Event Listeners
if (cartBtn) cartBtn.addEventListener('click', openCartModal);
if (closeCart) closeCart.addEventListener('click', closeCartModal);
if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

// Close modal when clicking outside
if (cartModal) {
  cartModal.addEventListener('click', function(e) {
    if (e.target === cartModal) {
      closeCartModal();
    }
  });
}

// Add to cart button listeners
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-to-cart-btn')) {
    const button = e.target;
    const product = {
      name: button.dataset.name,
      price: button.dataset.price,
      image: button.dataset.image || ''
    };
    
    addToCart(product);
    
    // Button feedback
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.background = 'var(--light-green)';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 1500);
  }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && cartModal && cartModal.style.display === 'flex') {
    closeCartModal();
  }
});

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.addToCart = addToCart;
window.clearCart = clearCart;

// Cart count update on page focus (in case items were added on another page)
window.addEventListener('focus', function() {
  loadCart();
  updateCartUI();
});

// Save cart before page unload
window.addEventListener('beforeunload', function() {
  saveCart();
});