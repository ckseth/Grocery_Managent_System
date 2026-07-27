const express = require('express');
const router = express.Router();
const { validateCoupon, getCoupons } = require('../controllers/couponController');

router.get('/', getCoupons);
router.post('/validate', validateCoupon);

module.exports = router;
