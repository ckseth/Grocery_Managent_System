const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Offer = require('../models/Offer');

// Helper to recalculate cart totals
const recalculateCartTotals = (cart) => {
  cart.subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  cart.tax = parseFloat((cart.subtotal * 0.05).toFixed(2)); // 5% Tax
  cart.deliveryFee = cart.subtotal > 50 || cart.subtotal === 0 ? 0.0 : 3.99;

  let discountAmount = 0;
  if (cart.appliedCoupon === 'FRESH20') {
    discountAmount = (cart.subtotal * 20) / 100;
  } else if (cart.appliedCoupon === 'GROCERY10' && cart.subtotal >= 30) {
    discountAmount = 10.0;
  } else if (cart.appliedCoupon === 'FREESHIP') {
    cart.deliveryFee = 0.0;
  }

  cart.discountAmount = parseFloat(discountAmount.toFixed(2));
  cart.grandTotal = Math.max(0, parseFloat((cart.subtotal + cart.tax + cart.deliveryFee - cart.discountAmount).toFixed(2)));
};

// @desc    Get user shopping cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findOne({
      $or: [{ _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }, { productId }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product._id.toString() || item.productId === product.productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += parseInt(quantity, 10);
    } else {
      cart.items.push({
        product: product._id,
        productId: product.productId,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.image,
        unit: product.unit,
        quantity: parseInt(quantity, 10)
      });
    }

    recalculateCartTotals(cart);
    await cart.save();

    res.json({ success: true, message: 'Item added to cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === req.params.productId || item.productId === req.params.productId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = parseInt(quantity, 10);
      }

      recalculateCartTotals(cart);
      await cart.save();
      return res.json({ success: true, message: 'Cart updated', cart });
    }

    res.status(404).json({ success: false, message: 'Item not found in cart' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId && item.productId !== req.params.productId
    );

    recalculateCartTotals(cart);
    await cart.save();

    res.json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.appliedCoupon = null;
      recalculateCartTotals(cart);
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const normalizedCode = code.trim().toUpperCase();

    const validCodes = ['FRESH20', 'GROCERY10', 'FREESHIP'];
    if (!validCodes.includes(normalizedCode)) {
      return res.status(400).json({ success: false, message: 'Invalid promo coupon code' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    cart.appliedCoupon = normalizedCode;
    recalculateCartTotals(cart);
    await cart.save();

    res.json({ success: true, message: `Coupon '${normalizedCode}' applied successfully!`, cart });
  } catch (error) {
    next(error);
  }
};
