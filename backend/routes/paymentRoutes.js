const express = require('express');
const router = express.Router();
const {
  processCOD,
  createStripeIntent,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/cod', processCOD);
router.post('/stripe/create-intent', createStripeIntent);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

module.exports = router;
