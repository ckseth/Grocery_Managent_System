const express = require('express');
const router = express.Router();
const {
  updateStock,
  getLowStockAlerts
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/low-stock', getLowStockAlerts);
router.put('/:productId/stock', updateStock);

module.exports = router;
