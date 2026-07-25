const Product = require('../models/Product');

// @desc    Update Product Stock Inventory
// @route   PUT /api/inventory/:productId/stock
// @access  Private/Admin
exports.updateStock = async (req, res, next) => {
  try {
    const { stock, availability } = req.body;

    const product = await Product.findOne({
      $or: [{ _id: req.params.productId.match(/^[0-9a-fA-F]{24}$/) ? req.params.productId : null }, { productId: req.params.productId }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.stock = Number(stock);
    if (availability) {
      product.availability = availability;
    } else {
      product.availability = product.stock <= 0 ? 'Out of Stock' : product.stock < 10 ? 'Limited Stock' : 'In Stock';
    }

    await product.save();

    res.json({
      success: true,
      message: `Inventory stock updated to ${product.stock} units`,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Low Stock Alert Products
// @route   GET /api/inventory/low-stock
// @access  Private/Admin
exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold, 10) : 10;
    const products = await Product.find({ stock: { $lte: threshold } });

    res.json({
      success: true,
      count: products.length,
      threshold,
      products
    });
  } catch (error) {
    next(error);
  }
};
