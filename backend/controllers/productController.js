const Product = require('../models/Product');

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, brand, search, minPrice, maxPrice, rating, inStock, sort, page = 1, limit = 50 } = req.query;

    let query = {};

    if (category) {
      query.category = { $in: Array.isArray(category) ? category : category.split(',') };
    }

    if (brand) {
      query.brand = { $in: Array.isArray(brand) ? brand : brand.split(',') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.discountPrice = {};
      if (minPrice) query.discountPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.discountPrice.$lte = parseFloat(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    if (inStock === 'true') {
      query.availability = 'In Stock';
    }

    // Sort options
    let sortOptions = {};
    if (sort === 'price-low') {
      sortOptions.discountPrice = 1;
    } else if (sort === 'price-high') {
      sortOptions.discountPrice = -1;
    } else if (sort === 'rating') {
      sortOptions.rating = -1;
    } else if (sort === 'newest') {
      sortOptions.createdAt = -1;
    } else {
      sortOptions.createdAt = -1; // Default
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or productId
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { productId: req.params.id }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Featured Products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Related Products by Category
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    res.json({ success: true, count: related.length, products: related });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Best Sellers
// @route   GET /api/products/bestsellers
// @access  Public
exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ reviewCount: -1, rating: -1 }).limit(8);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a Product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a Product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
exports.uploadProductImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }
  res.json({
    success: true,
    imageUrl: `/uploads/${req.file.filename}`
  });
};
