const Coupon = require('../models/Coupon');

// @desc    Validate a promo coupon code
// @route   POST /api/coupons/validate
// @access  Public / Protected
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a coupon code'
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive coupon code'
      });
    }

    // Expiry check
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon code has expired'
      });
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This coupon usage limit has been reached'
      });
    }

    // Minimum order check
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for ${normalizedCode} is ₹${coupon.minOrderValue}`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = (subtotal * (coupon.discountValue || coupon.discountPercentage || 0)) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    res.status(200).json({
      success: true,
      message: `Coupon '${normalizedCode}' applied successfully!`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue || coupon.discountPercentage,
        discountAmount: discountAmount.toFixed(2),
        minOrderValue: coupon.minOrderValue
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
