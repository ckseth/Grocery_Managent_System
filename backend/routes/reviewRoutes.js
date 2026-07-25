const express = require('express');
const router = express.Router();
const {
  addReview,
  getProductReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', protect, addReview);
router.delete('/reviews/:id', protect, deleteReview);

module.exports = router;
