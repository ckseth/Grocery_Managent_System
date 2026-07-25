# GroceryGo MERN REST API Backend

Production-ready Node.js, Express.js & MongoDB backend for the **GroceryGo** food & organic grocery delivery platform.

## Features
- **MVC Architecture**: Decoupled Controllers, Services, Models & Routes.
- **Authentication**: JWT auth, bcrypt password hashing, role-based authorization (`customer`, `admin`), password reset workflow.
- **Security Middlewares**: Helmet security headers, CORS protection, Compression, Mongo Sanitize, Rate Limiter (`express-rate-limit`).
- **Product & Category Engine**: Search, filter by price/brand/rating, featured products, bestsellers, inventory stock alerts.
- **Cart & Wishlist**: Subtotal, tax (5%), delivery fees, promo coupons (`FRESH20`, `GROCERY10`), persistence.
- **Orders & Checkout**: Order tracking timeline, cancel order, HTML/PDF invoice generation.
- **Payment Gateway Integrations**: Cash on Delivery, Stripe Payment Intents, Razorpay Orders & HMAC Verification.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and adjust database/JWT values:
   ```bash
   cp .env.example .env
   ```

3. **Database Seeding (Optional)**:
   Seed default categories and coupons:
   ```bash
   npm run seed
   ```

4. **Start Server**:
   Development mode with nodemon:
   ```bash
   npm run dev
   ```
   Production mode:
   ```bash
   npm start
   ```

5. **API Documentation & Testing**:
   - Refer to `API_DOCUMENTATION.md` for full endpoints reference.
   - Import `Postman_Collection.json` into Postman to test API requests.
