const Offer = require('../models/Offer');

// @desc    Get active promo offers & coupons
// @route   GET /api/offers
// @access  Public
exports.getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ isActive: true });
    res.json({ success: true, count: offers.length, offers });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Offer / Promo Coupon
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, message: 'Offer created', offer });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate Coupon Code
// @route   POST /api/offers/validate
// @access  Public
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const offer = await Offer.findOne({ code: code.trim().toUpperCase(), isActive: true });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Invalid or expired promo code' });
    }

    res.json({ success: true, message: 'Coupon code is valid', offer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    await offer.deleteOne();
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
