# GroceryGo Backend REST API Documentation

Production Ready MERN Backend API endpoints specification for GroceryGo e-commerce platform.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication APIs (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Login customer & receive JWT |
| `GET` | `/api/auth/logout` | Private | Logout user |
| `GET` | `/api/auth/profile` | Private | Get authenticated profile & wishlist |
| `PUT` | `/api/auth/profile` | Private | Update profile & default addresses |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset token email |
| `PUT` | `/api/auth/reset-password/:token` | Public | Reset password using token |

---

## 2. Admin APIs (`/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/admin/login` | Public | Admin portal login |
| `GET` | `/api/admin/dashboard` | Admin | Get metrics, total revenue & low stock alerts |
| `GET` | `/api/admin/users` | Admin | List all registered customers |
| `PUT` | `/api/admin/users/:id/role` | Admin | Update user role (`customer` / `admin`) |

---

## 3. Product APIs (`/api/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Browse products with search, category, brand, price, rating filters & sorting |
| `GET` | `/api/products/featured` | Public | Get 8 featured organic products |
| `GET` | `/api/products/bestsellers` | Public | Get top selling items |
| `GET` | `/api/products/:id` | Public | Get product details by ID |
| `GET` | `/api/products/:id/related` | Public | Get related items in same category |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/:id` | Admin | Update product details |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `POST` | `/api/products/upload` | Admin | Upload image file (Multer) |

---

## 4. Category APIs (`/api/categories`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | Get all active categories |
| `GET` | `/api/categories/:id` | Public | Get category details |
| `POST` | `/api/categories` | Admin | Create category |
| `PUT` | `/api/categories/:id` | Admin | Update category |
| `DELETE` | `/api/categories/:id` | Admin | Delete category |

---

## 5. Shopping Cart APIs (`/api/cart`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Private | Get user cart & totals |
| `POST` | `/api/cart` | Private | Add item to cart |
| `PUT` | `/api/cart/items/:productId` | Private | Update item quantity |
| `DELETE` | `/api/cart/items/:productId` | Private | Remove item from cart |
| `DELETE` | `/api/cart` | Private | Clear entire cart |
| `POST` | `/api/cart/apply-coupon` | Private | Apply promo coupon (`FRESH20`, `GROCERY10`) |

---

## 6. Wishlist APIs (`/api/wishlist`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/wishlist` | Private | Get saved wishlist items |
| `POST` | `/api/wishlist/:productId` | Private | Add product to wishlist |
| `DELETE` | `/api/wishlist/:productId` | Private | Remove product from wishlist |

---

## 7. Order & Checkout APIs (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Private | Place new order from active cart |
| `GET` | `/api/orders/myorders` | Private | Get customer order history |
| `GET` | `/api/orders/:id` | Private | Get order tracking & details |
| `GET` | `/api/orders` | Admin | List all platform orders |
| `PUT` | `/api/orders/:id/status` | Admin | Update status (`Packed`, `Out for Delivery`, `Delivered`) |
| `PUT` | `/api/orders/:id/cancel` | Private | Cancel order |
| `GET` | `/api/orders/:id/invoice` | Private | Generate HTML/PDF Invoice receipt |

---

## 8. Payment Gateway APIs (`/api/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/cod` | Private | Select Cash on Delivery mode |
| `POST` | `/api/payments/stripe/create-intent` | Private | Create Stripe Payment Intent |
| `POST` | `/api/payments/razorpay/create-order` | Private | Create Razorpay Order |
| `POST` | `/api/payments/razorpay/verify` | Private | Verify Razorpay Payment Signature |

---

## 9. Review APIs (`/api`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/products/:productId/reviews` | Private | Submit product rating & review |
| `GET` | `/api/products/:productId/reviews` | Public | Get product reviews |
| `DELETE` | `/api/reviews/:id` | Private | Delete review |

---

## 10. Offer & Inventory APIs (`/api/offers`, `/api/inventory`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/offers` | Public | List active offers & promo codes |
| `POST` | `/api/offers/validate` | Public | Validate promo coupon |
| `GET` | `/api/inventory/low-stock` | Admin | Low stock alerts |
| `PUT` | `/api/inventory/:productId/stock` | Admin | Update stock inventory |
