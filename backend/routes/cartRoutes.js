const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  applyCoupon
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.put('/items/:productId', updateCartQuantity);
router.delete('/items/:productId', removeFromCart);
router.post('/apply-coupon', applyCoupon);

module.exports = router;
