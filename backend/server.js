const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security & Optimization Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Root API Welcome Dashboard Route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to GroceryGo REST API Backend Server!',
    documentation: 'See API_DOCUMENTATION.md for endpoint details',
    healthCheck: '/api/health',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      wishlist: '/api/wishlist',
      orders: '/api/orders',
      payments: '/api/payments',
      reviews: '/api/reviews',
      offers: '/api/offers',
      inventory: '/api/inventory'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GroceryGo API Endpoint Directory',
    healthCheck: '/api/health',
    version: '1.0.0'
  });
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GroceryGo REST API Backend',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api', require('./routes/reviewRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = (portToUse) => {
  const server = app.listen(portToUse, () => {
    console.log(`GroceryGo Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${portToUse}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const altPort = Number(portToUse) + 1;
      console.warn(`Port ${portToUse} is in use. Switching to port ${altPort}...`);
      startServer(altPort);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);
