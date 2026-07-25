const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Add product review & recalculate rating
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const product = await Product.findOne({
      $or: [{ _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }, { productId }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = await Review.findOne({
      product: product._id,
      user: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed by you' });
    }

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment
    });

    // Recalculate average rating & reviewCount for product
    const reviews = await Review.find({ product: product._id });
    product.reviewCount = reviews.length;
    product.rating = parseFloat(
      (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1)
    );

    await product.save();

    res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.productId.match(/^[0-9a-fA-F]{24}$/) ? req.params.productId : null }, { productId: req.params.productId }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating
    const reviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    if (product) {
      product.reviewCount = reviews.length;
      product.rating = reviews.length > 0
        ? parseFloat((reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1))
        : 4.5;
      await product.save();
    }

    res.json({ success: true, message: 'Review removed successfully' });
  } catch (error) {
    next(error);
  }
};
