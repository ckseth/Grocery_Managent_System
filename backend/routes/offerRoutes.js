const express = require('express');
const router = express.Router();
const {
  getOffers,
  createOffer,
  validateCoupon,
  deleteOffer
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getOffers)
  .post(protect, authorize('admin'), createOffer);

router.post('/validate', validateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteOffer);

module.exports = router;
