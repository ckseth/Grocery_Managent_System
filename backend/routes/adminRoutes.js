const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getDashboardStats,
  getAllOrders,
  updateDeliveryStatus,
  getAllUsers,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, adminLogin);

// Protected Admin Routes
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/orders', protect, authorize('admin'), getAllOrders);
router.put('/orders/:id/status', protect, authorize('admin'), updateDeliveryStatus);

router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

router.post('/products', protect, authorize('admin'), createProduct);
router.put('/products/:id', protect, authorize('admin'), updateProduct);
router.delete('/products/:id', protect, authorize('admin'), deleteProduct);

router.post('/categories', protect, authorize('admin'), createCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
