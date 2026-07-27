/* GroceryGo Main Application Logic & UI Handlers */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Theme
  const savedTheme = store.getTheme();
  store.setTheme(savedTheme);

  // Hide Preloader
  const preloader = document.getElementById("page-preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = "0";
      preloader.style.visibility = "hidden";
    }, 300);
  }

  // Update Header Badges & Navbar Auth Status
  updateHeaderBadges();
  renderNavbarAuth();

  // Listen to store updates
  window.addEventListener("storeUpdated", () => {
    updateHeaderBadges();
    renderNavbarAuth();
    renderOffcanvasCart();
  });

  // Global Theme Switcher listeners
  const themeToggles = document.querySelectorAll(".theme-toggle-btn");
  themeToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const newTheme = store.toggleTheme();
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, "info");
    });
  });

  // Render Offcanvas Cart on initialization
  renderOffcanvasCart();

  // Setup Global Quick View Modal listener
  setupQuickViewModal();

  // Setup Global Search bar
  setupGlobalSearch();

  // Setup Universal Modal Close Listener (ESC key, backdrop, data-bs-dismiss)
  setupUniversalModalHandlers();
});

// Dynamic Navbar Authentication & Role Status Renderer
function renderNavbarAuth() {
  const authContainers = document.querySelectorAll(".navbar-auth-container");
  const isLoggedIn = store.isLoggedIn();
  const user = store.getUser();
  const isAdmin = user && (user.role === 'admin' || user.isAdmin);

  authContainers.forEach((container) => {
    if (isLoggedIn && user && user.name) {
      const initial = user.name.trim().charAt(0).toUpperCase();
      container.innerHTML = `
        <div class="dropdown gg-user-dropdown position-relative">
          <button class="btn p-0 border-0 user-avatar-toggle-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="${user.name}">
            <div class="user-initial-avatar ${isAdmin ? 'bg-danger text-white' : ''}">${initial}</div>
          </button>
          <ul class="dropdown-menu dropdown-menu-start dropdown-menu-lg-end shadow-lg border-0 mt-2 py-2" style="min-width: 230px; z-index: 9999;">
            <li class="px-3 py-2 border-bottom bg-light">
              <div class="fw-bold text-main small">${user.name} ${isAdmin ? '<span class="badge bg-danger ms-1">Admin</span>' : ''}</div>
              <div class="text-muted extra-small" style="font-size: 0.75rem;">${user.email || 'Member'}</div>
            </li>
            ${isAdmin ? '<li><a class="dropdown-item py-2 fw-bold text-danger" href="admin-dashboard.html"><i class="bi bi-speedometer2 me-2"></i> Admin Dashboard</a></li><li><hr class="dropdown-divider my-1"></li>' : ''}
            <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person me-2 text-success"></i> My Profile</a></li>
            <li><a class="dropdown-item py-2" href="orders.html"><i class="bi bi-box-seam me-2 text-info"></i> My Orders</a></li>
            <li><a class="dropdown-item py-2" href="order-tracking.html"><i class="bi bi-truck me-2 text-warning"></i> Track Order</a></li>
            <li><a class="dropdown-item py-2" href="wishlist.html"><i class="bi bi-heart me-2 text-danger"></i> Saved Wishlist</a></li>
            <li><hr class="dropdown-divider my-1"></li>
            <li><button type="button" class="dropdown-item py-2 text-danger logout-action-btn"><i class="bi bi-box-arrow-right me-2"></i> Logout</button></li>
          </ul>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <a href="login.html" class="btn btn-outline-custom p-2 d-flex align-items-center justify-content-center" title="Login Account">
            <i class="bi bi-person fs-5"></i>
          </a>
          <a href="admin-login.html" class="btn btn-sm btn-outline-danger p-2 d-none d-md-inline-block" title="Admin Portal">
            <i class="bi bi-shield-lock me-1"></i> Admin
          </a>
        </div>
      `;
    }
  });
}

// Global Event Delegation for Clicks
document.addEventListener("click", (e) => {
  // Logout button
  const logoutBtn = e.target.closest(".logout-action-btn");
  if (logoutBtn) {
    e.preventDefault();
    store.logout();
    showToast("Logged out successfully.", "info");
    renderNavbarAuth();
    setTimeout(() => {
      window.location.href = "login.html";
    }, 500);
    return;
  }

  // Avatar dropdown toggle fallback
  const avatarBtn = e.target.closest(".user-avatar-toggle-btn");
  if (avatarBtn) {
    const dropdownParent = avatarBtn.closest(".gg-user-dropdown");
    if (dropdownParent) {
      const menu = dropdownParent.querySelector(".dropdown-menu");
      if (menu) {
        menu.classList.toggle("show");
      }
    }
  } else {
    if (!e.target.closest(".gg-user-dropdown")) {
      document.querySelectorAll(".gg-user-dropdown .dropdown-menu").forEach((m) => m.classList.remove("show"));
    }
  }

  // Add to cart button
  const cartBtn = e.target.closest(".add-to-cart-btn");
  if (cartBtn) {
    e.stopPropagation();
    const id = cartBtn.getAttribute("data-id");
    if (id && store.addToCart(id, 1)) {
      const prod = typeof GROCERY_PRODUCTS !== "undefined" ? GROCERY_PRODUCTS.find((p) => p.id === id) : null;
      showToast(`Added <strong>${prod ? prod.name : 'Item'}</strong> to cart!`, "success");
      openOffcanvasCartDrawer();
    }
    return;
  }

  // Wishlist heart button
  const wishBtn = e.target.closest(".wishlist-btn-corner");
  if (wishBtn) {
    e.stopPropagation();
    const id = wishBtn.getAttribute("data-id");
    const res = store.toggleWishlist(id);
    const icon = wishBtn.querySelector("i");
    if (res.added) {
      wishBtn.classList.add("active");
      if (icon) icon.className = "bi bi-heart-fill";
      showToast(res.message, "success");
    } else {
      wishBtn.classList.remove("active");
      if (icon) icon.className = "bi bi-heart";
      showToast(res.message, "warning");
    }
    return;
  }

  // Quick View Trigger or Product Card Click
  const qvTrigger = e.target.closest(".quick-view-trigger");
  if (qvTrigger) {
    e.stopPropagation();
    const id = qvTrigger.getAttribute("data-id");
    if (id && typeof window.openQuickViewModal === "function") {
      window.openQuickViewModal(id);
    }
    return;
  }
});

// Universal Modal Close Handler (ESC, backdrop, data-bs-dismiss)
function setupUniversalModalHandlers() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.show").forEach((modalEl) => {
        closeBootstrapModal(modalEl);
      });
    }
  });

  document.addEventListener("click", (e) => {
    const dismissBtn = e.target.closest('[data-bs-dismiss="modal"]');
    if (dismissBtn) {
      const modalEl = dismissBtn.closest(".modal");
      if (modalEl) {
        closeBootstrapModal(modalEl);
      }
    }

    if (e.target.classList.contains("modal") && e.target.classList.contains("show")) {
      closeBootstrapModal(e.target);
    }
  });
}

function openBootstrapModal(modalEl) {
  if (!modalEl) return;
  if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
    try {
      let modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalEl);
      }
      modalInstance.show();
      return;
    } catch (err) {}
  }
  modalEl.classList.add("show");
  modalEl.style.display = "block";
  document.body.classList.add("modal-open");
}

function closeBootstrapModal(modalEl) {
  if (!modalEl) return;
  if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
    try {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
        return;
      }
    } catch (err) {}
  }
  modalEl.classList.remove("show");
  modalEl.style.display = "none";
  document.body.classList.remove("modal-open");
  const backdrops = document.querySelectorAll(".modal-backdrop");
  backdrops.forEach((b) => b.remove());
}

function openOffcanvasCartDrawer() {
  const cartOffcanvasEl = document.getElementById("cartOffcanvas");
  if (!cartOffcanvasEl) return;
  if (typeof bootstrap !== "undefined" && bootstrap.Offcanvas) {
    try {
      let offcanvasInstance = bootstrap.Offcanvas.getInstance(cartOffcanvasEl);
      if (!offcanvasInstance) {
        offcanvasInstance = new bootstrap.Offcanvas(cartOffcanvasEl);
      }
      offcanvasInstance.show();
      return;
    } catch (e) {}
  }
  cartOffcanvasEl.classList.add("show");
  cartOffcanvasEl.style.visibility = "visible";
  document.body.classList.add("offcanvas-open");
}

// Update Cart and Wishlist header badge counters
function updateHeaderBadges() {
  const cartBadges = document.querySelectorAll(".cart-count-badge");
  const wishlistBadges = document.querySelectorAll(".wishlist-count-badge");

  const cartCount = store.getCartCount();
  const wishlistCount = store.getWishlistCount();

  cartBadges.forEach((el) => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? "inline-block" : "none";
  });

  wishlistBadges.forEach((el) => {
    el.textContent = wishlistCount;
    el.style.display = wishlistCount > 0 ? "inline-block" : "none";
  });
}

// Generate Product Card HTML
function createProductCardHTML(product) {
  const isWishlisted = store.isInWishlist(product.id);
  const badgeHTML = product.badge
    ? `<span class="product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, "")}">${product.badge}</span>`
    : "";

  const price = parseFloat(product.discountPrice || product.price || 0);
  const origPrice = parseFloat(product.price || 0);

  return `
    <div class="col-6 col-md-4 col-lg-3 mb-4">
      <div class="product-card" data-id="${product.id}">
        <div class="product-img-wrapper">
          ${badgeHTML}
          <button class="wishlist-btn-corner ${isWishlisted ? 'active' : ''}" data-id="${product.id}" title="Add to Wishlist">
            <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}"></i>
          </button>
          <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
          <button class="quick-view-trigger" data-id="${product.id}">
            <i class="bi bi-eye me-1"></i> Quick View
          </button>
        </div>
        <div class="product-body">
          <div class="product-category">${product.category} • ${product.brand || 'Fresh'}</div>
          <h6 class="product-title" title="${product.name}">${product.name}</h6>
          <div class="product-rating">
            <i class="bi bi-star-fill text-warning"></i>
            <span class="fw-bold">${product.rating || '4.5'}</span>
            <span class="rating-count">(${product.reviewCount || 12})</span>
            <span class="ms-auto text-muted small">${product.unit || '1 unit'}</span>
          </div>
          <div class="product-footer">
            <div class="price-box">
              <span class="current-price">₹${price.toFixed(2)}</span>
              ${price < origPrice ? `<span class="original-price">₹${origPrice.toFixed(2)}</span>` : ''}
            </div>
            <button class="btn btn-primary-custom btn-sm add-to-cart-btn" data-id="${product.id}">
              <i class="bi bi-basket me-1"></i> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Setup Quick View Modal
function setupQuickViewModal() {
  const modalEl = document.getElementById("quickViewModal");
  if (!modalEl) return;

  window.openQuickViewModal = (productId) => {
    if (typeof GROCERY_PRODUCTS === "undefined") return;
    const product = GROCERY_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const qvImg = document.getElementById("qv-img");
    const qvTitle = document.getElementById("qv-title");
    const qvCategory = document.getElementById("qv-category");
    const qvBrand = document.getElementById("qv-brand");
    const qvPrice = document.getElementById("qv-price");
    const qvOriginalPrice = document.getElementById("qv-original-price");
    const qvRating = document.getElementById("qv-rating");
    const qvReviews = document.getElementById("qv-reviews");
    const qvDescription = document.getElementById("qv-description");
    const qvUnit = document.getElementById("qv-unit");

    if (qvImg) qvImg.src = product.image;
    if (qvTitle) qvTitle.textContent = product.name;
    if (qvCategory) qvCategory.textContent = product.category ? product.category.toUpperCase() : "GROCERY";
    if (qvBrand) qvBrand.textContent = product.brand || "";
    if (qvPrice) qvPrice.textContent = `₹${parseFloat(product.discountPrice || product.price || 0).toFixed(2)}`;
    if (qvOriginalPrice) qvOriginalPrice.textContent = product.discountPrice < product.price ? `₹${parseFloat(product.price).toFixed(2)}` : "";
    if (qvRating) qvRating.textContent = product.rating || "4.5";
    if (qvReviews) qvReviews.textContent = `(${product.reviewCount || 0} reviews)`;
    if (qvDescription) qvDescription.textContent = product.description || "";
    if (qvUnit) qvUnit.textContent = product.unit || "1 unit";

    const addBtn = document.getElementById("qv-add-cart-btn");
    const qtyInput = document.getElementById("qv-qty-input");
    if (qtyInput) qtyInput.value = 1;

    if (addBtn) {
      addBtn.onclick = () => {
        const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
        store.addToCart(product.id, qty);
        showToast(`Added ${qty} x ${product.name} to cart!`, "success");
        closeBootstrapModal(modalEl);
      };
    }

    openBootstrapModal(modalEl);
  };
}

// Offcanvas Mini Cart Renderer
function renderOffcanvasCart() {
  const cartContainer = document.getElementById("offcanvas-cart-items");
  const cartSubtotal = document.getElementById("offcanvas-cart-subtotal");
  if (!cartContainer) return;

  const items = store.getCart();
  const totals = store.getCartTotals();

  if (items.length === 0) {
    cartContainer.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-cart-x fs-1 text-muted"></i>
        <p class="mt-2 text-muted">Your cart is currently empty.</p>
        <a href="products.html" class="btn btn-sm btn-primary-custom">Start Shopping</a>
      </div>
    `;
    if (cartSubtotal) cartSubtotal.textContent = "₹0.00";
    return;
  }

  cartContainer.innerHTML = items
    .map((item) => {
      const itemPrice = parseFloat(item.price || 0);
      const itemQty = parseInt(item.quantity || 1, 10);
      return `
    <div class="offcanvas-cart-item">
      <img src="${item.image}" alt="${item.name}" class="offcanvas-cart-img">
      <div class="flex-grow-1">
        <h6 class="mb-1 fs-6">${item.name}</h6>
        <div class="text-muted small">₹${itemPrice.toFixed(2)} x ${itemQty}</div>
      </div>
      <div class="fw-bold text-success me-2">₹${(itemPrice * itemQty).toFixed(2)}</div>
      <button class="btn btn-link text-danger p-0" onclick="store.removeFromCart('${item.id}')">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
    })
    .join("");

  if (cartSubtotal) cartSubtotal.textContent = `₹${totals.subtotal}`;
}

// Setup Global Search bar with Live Type Search Support
function setupGlobalSearch() {
  const searchInputs = document.querySelectorAll(".global-search-input");
  searchInputs.forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = input.value.trim();
        if (query) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  });
}
