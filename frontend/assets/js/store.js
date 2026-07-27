/* GroceryGo LocalStorage State Management Store */

class GroceryStore {
  constructor() {
    this.CART_KEY = "grocerygo_cart";
    this.WISHLIST_KEY = "grocerygo_wishlist";
    this.THEME_KEY = "grocerygo_theme";
    this.COUPON_KEY = "grocerygo_applied_coupon";
    this.ORDERS_KEY = "grocerygo_orders";
    this.ACTIVE_ORDER_KEY = "grocerygo_active_order";
    this.USER_KEY = "grocerygo_user";
    
    this.cart = this.load(this.CART_KEY, []);
    this.wishlist = this.load(this.WISHLIST_KEY, []);
    this.appliedCoupon = this.load(this.COUPON_KEY, null);
    this.orders = this.load(this.ORDERS_KEY, []);
    this.user = this.load(this.USER_KEY, null);
    
    this.validCoupons = {
      "SAVE10": { type: "percent", value: 10, minOrder: 100, description: "10% off on orders above ₹100" },
      "SAVE20": { type: "percent", value: 20, minOrder: 200, description: "20% off on orders above ₹200" },
      "FIRST50": { type: "fixed", value: 50.00, minOrder: 150, description: "₹50 off on orders above ₹150" },
      "FRESH20": { type: "percent", value: 20, minOrder: 0, description: "20% off entire order" },
      "GROCERY10": { type: "fixed", value: 10.00, minOrder: 30, description: "₹10 off orders above ₹30" },
      "FREESHIP": { type: "shipping", value: 100, minOrder: 0, description: "Free Express Shipping" }
    };
  }

  // --- AUTHENTICATION METHODS ---
  isLoggedIn() {
    return this.user && this.user.isLoggedIn === true;
  }

  isAdmin() {
    return this.user && (this.user.role === "admin" || this.user.isAdmin === true);
  }

  getUser() {
    return this.user || { name: "Sarah Miller", email: "sarah.miller@example.com", role: "customer", isLoggedIn: true };
  }

  login(userData) {
    this.user = { ...userData, isLoggedIn: true };
    this.save(this.USER_KEY, this.user);
    this.notifyUpdate();
  }

  logout() {
    this.user = null;
    this.save(this.USER_KEY, null);
    this.notifyUpdate();
  }

  load(key, defaultValue) {
    if (!this.memoryStore) this.memoryStore = {};
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      }
    } catch (e) {
      // Memory fallback if storage is blocked by browser tracking prevention
      return this.memoryStore[key] !== undefined ? this.memoryStore[key] : defaultValue;
    }
    return this.memoryStore[key] !== undefined ? this.memoryStore[key] : defaultValue;
  }

  save(key, value) {
    if (!this.memoryStore) this.memoryStore = {};
    this.memoryStore[key] = value;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      // Storage blocked by browser privacy settings - using in-memory store
    }
  }

  // --- CART METHODS ---
  getCart() {
    return this.cart;
  }

  addToCart(productId, quantity = 1) {
    const itemIndex = this.cart.findIndex(item => item.id === productId);
    const product = GROCERY_PRODUCTS.find(p => p.id === productId);

    if (!product) return false;

    if (itemIndex > -1) {
      this.cart[itemIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        image: product.image,
        unit: product.unit,
        quantity: quantity
      });
    }

    this.save(this.CART_KEY, this.cart);
    this.notifyUpdate();
    return true;
  }

  updateQuantity(productId, newQty) {
    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity = newQty;
      this.save(this.CART_KEY, this.cart);
      this.notifyUpdate();
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.save(this.CART_KEY, this.cart);
    this.notifyUpdate();
  }

  clearCart() {
    this.cart = [];
    this.appliedCoupon = null;
    this.save(this.CART_KEY, this.cart);
    this.save(this.COUPON_KEY, null);
    this.notifyUpdate();
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotals() {
    const subtotal = this.cart.reduce((total, item) => {
      const p = parseFloat(item.price || 0);
      const q = parseInt(item.quantity || 1, 10);
      return total + (p * q);
    }, 0);
    const tax = subtotal * 0.05; // 5% Estimated Tax
    
    let deliveryFee = subtotal > 50 || subtotal === 0 ? 0.00 : 3.99;
    let discountAmount = 0;

    if (this.appliedCoupon) {
      const coupon = this.validCoupons[this.appliedCoupon];
      if (coupon) {
        const minOrder = coupon.minOrder || 0;
        if (subtotal >= minOrder) {
          if (coupon.type === "percent") {
            discountAmount = (subtotal * coupon.value) / 100;
          } else if (coupon.type === "fixed") {
            discountAmount = Math.min(coupon.value, subtotal);
          } else if (coupon.type === "shipping") {
            deliveryFee = 0.00;
          }
        }
      }
    }

    const grandTotal = Math.max(0, subtotal + tax + deliveryFee - discountAmount);

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      appliedCoupon: this.appliedCoupon
    };
  }

  applyCoupon(code) {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = this.validCoupons[normalizedCode];
    if (coupon) {
      const subtotal = this.cart.reduce((total, item) => total + (parseFloat(item.price || 0) * parseInt(item.quantity || 1, 10)), 0);
      if (coupon.minOrder && subtotal < coupon.minOrder) {
        return { success: false, message: `Minimum order amount for ${normalizedCode} is ₹${coupon.minOrder}.` };
      }
      this.appliedCoupon = normalizedCode;
      this.save(this.COUPON_KEY, this.appliedCoupon);
      this.notifyUpdate();
      return { success: true, message: `Coupon '${normalizedCode}' applied successfully!` };
    }
    return { success: false, message: "Invalid promo coupon code." };
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.save(this.COUPON_KEY, null);
    this.notifyUpdate();
  }

  // --- WISHLIST METHODS ---
  getWishlist() {
    return this.wishlist;
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  toggleWishlist(productId) {
    if (this.isInWishlist(productId)) {
      this.wishlist = this.wishlist.filter(id => id !== productId);
      this.save(this.WISHLIST_KEY, this.wishlist);
      this.notifyUpdate();
      return { added: false, message: "Removed from Wishlist" };
    } else {
      this.wishlist.push(productId);
      this.save(this.WISHLIST_KEY, this.wishlist);
      this.notifyUpdate();
      return { added: true, message: "Added to Wishlist" };
    }
  }

  getWishlistCount() {
    return this.wishlist.length;
  }

  // --- THEME METHODS ---
  getTheme() {
    return this.load(this.THEME_KEY, "light");
  }

  setTheme(theme) {
    this.save(this.THEME_KEY, theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
  }

  toggleTheme() {
    const current = this.getTheme();
    const nextTheme = current === "light" ? "dark" : "light";
    this.setTheme(nextTheme);
    return nextTheme;
  }

  // --- ORDER METHODS ---
  createOrder(shippingAddress, paymentMethod) {
    const totals = this.getCartTotals();
    const newOrder = {
      orderId: "GO-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: [...this.cart],
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      totals: totals,
      status: "Order Placed",
      estimatedDelivery: "Today, within 10 mins"
    };

    this.orders.unshift(newOrder);
    this.save(this.ORDERS_KEY, this.orders);
    this.save(this.ACTIVE_ORDER_KEY, newOrder);
    this.clearCart();
    return newOrder;
  }

  getActiveOrder() {
    return this.load(this.ACTIVE_ORDER_KEY, this.orders[0] || null);
  }

  // Helper notification dispatcher
  notifyUpdate() {
    const event = new CustomEvent("storeUpdated", { detail: { cartCount: this.getCartCount(), wishlistCount: this.getWishlistCount() } });
    window.dispatchEvent(event);
  }
}

const store = new GroceryStore();

// Toast notification helper
function showToast(message, type = "success") {
  let toastContainer = document.getElementById("gg-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "gg-toast-container";
    toastContainer.className = "toast-container-custom";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  const iconClass = type === "danger" ? "bi-exclamation-octagon-fill" : type === "warning" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill";
  toast.className = `toast-custom toast-${type}`;
  toast.innerHTML = `
    <i class="bi ${iconClass} fs-5"></i>
    <div class="flex-grow-1 font-weight-500">${message}</div>
    <button type="button" class="btn-close ms-2" onclick="this.parentElement.remove()"></button>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 3500);
}
