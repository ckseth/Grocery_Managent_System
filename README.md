# 🛒 GroceryGo – Online Grocery Delivery System

GroceryGo is a full-stack grocery delivery web application that enables users to browse products, manage carts, apply coupons, place orders, and make secure online payments. The project is designed with separate Customer and Admin modules, providing an efficient and user-friendly grocery shopping experience.

---

## 🚀 Features

### Customer
- User Registration & Login (JWT Authentication)
- Browse Products by Category
- Search Products
- Add to Cart & Wishlist
- Apply Coupon Codes
- Secure Checkout
- Online Payment Integration
- Order Tracking
- User Profile Management
- Responsive Design

### Admin
- Admin Dashboard
- Add / Update / Delete Products
- Manage Categories
- Manage Orders
- Update Order Status
- Manage Coupons
- Inventory Management

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT (JSON Web Token)

### Payment Gateway
- Stripe / Razorpay

### Other Tools
- Nodemailer
- CORS
- Helmet
- dotenv

---

## 📂 Project Structure

```
GroceryGo/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── data/
│   └── server.js
│
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── *.html
│
├── README.md
└── package.json
```

---

## 📊 Modules

- Authentication Module
- Product Management
- Category Management
- Cart Module
- Wishlist Module
- Coupon Module
- Order Module
- Payment Module
- Admin Dashboard
- User Profile Module

---

## 🗄️ Database Collections

- Users
- Addresses
- Categories
- Brands
- Products
- Cart
- Cart Items
- Wishlist
- Orders
- Order Items
- Payments
- Coupons
- Reviews

---

## 🔐 Authentication

- JWT Authentication
- Protected Routes
- Role-Based Authorization
- Admin Access Control

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/GroceryGo.git
```

### Go to Project Folder

```bash
cd GroceryGo
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Start Backend

```bash
npm start
```

or

```bash
npm run dev
```

---

## 🌐 Frontend

Open the frontend files using Live Server or serve them through your backend.

---

## 📌 API Routes

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Products

```
GET /api/products
GET /api/products/:id
```

### Orders

```
POST /api/orders
GET /api/orders
```

### Coupons

```
POST /api/coupons/apply
```

---

## 📸 Screenshots

Add screenshots of:

- Home Page
- Product Page
- Cart
- Checkout
- Payment
- Admin Dashboard

---

## 🔮 Future Enhancements

- Real-Time Order Tracking
- Push Notifications
- AI Product Recommendation
- Voice Search
- Multi-Vendor Support
- Progressive Web App (PWA)

---

## 👩‍💻 Author

**Chhavi Kumari**

MCA Student | Full Stack Developer

GitHub: https://github.com/your-github-username

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.
