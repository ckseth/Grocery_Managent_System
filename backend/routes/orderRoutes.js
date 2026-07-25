const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getInvoice
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(authorize('admin'), getAllOrders);

router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.get('/:id/invoice', getInvoice);

module.exports = router;
