const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getRelatedProducts,
  getBestSellers,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellers);
router.post('/upload', protect, authorize('admin'), upload.single('image'), uploadProductImage);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.get('/:id/related', getRelatedProducts);

module.exports = router;
