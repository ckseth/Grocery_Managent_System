const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { generateInvoiceHTML } = require('../utils/invoiceGenerator');

const DELIVERY_STEPS = [
  'Order Placed',
  'Order Confirmed',
  'Preparing Food',
  'Packed',
  'Out For Delivery',
  'Near Your Location',
  'Delivered'
];

// @desc    Create / Place a new Order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, items: directItems, totals: directTotals, notes } = req.body;

    let itemsToOrder = [];
    let totalsToSave = {};

    if (directItems && directItems.length > 0) {
      itemsToOrder = directItems;
      totalsToSave = directTotals || {};
    } else {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
      }
      itemsToOrder = cart.items;
      totalsToSave = {
        subtotal: cart.subtotal,
        tax: cart.tax,
        deliveryFee: cart.deliveryFee,
        discountAmount: cart.discountAmount,
        grandTotal: cart.grandTotal,
        appliedCoupon: cart.appliedCoupon
      };

      // Clear user cart
      cart.items = [];
      cart.appliedCoupon = null;
      cart.subtotal = 0;
      cart.grandTotal = 0;
      await cart.save();
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const trackingTimeline = DELIVERY_STEPS.map((step, idx) => ({
      stepName: step,
      status: step,
      time: idx === 0 ? new Date() : null,
      completed: idx === 0,
      note: idx === 0 ? 'Order submitted successfully' : 'Pending'
    }));

    const order = await Order.create({
      orderId,
      user: req.user._id,
      items: itemsToOrder,
      shippingAddress: shippingAddress || {
        name: req.user.name,
        email: req.user.email,
        phone: '555-0199',
        address: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        zip: '97477',
        notes: notes || ''
      },
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Order Placed',
      currentStepIndex: 0,
      totals: totalsToSave,
      trackingTimeline
    });

    // Reduce stock quantities for ordered products
    for (const item of itemsToOrder) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        }).catch(() => {});
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// Helper to find order safely by _id or orderId
const findOrderByIdOrString = async (idParam) => {
  const isObjectId = typeof idParam === 'string' && /^[0-9a-fA-F]{24}$/.test(idParam);
  return await Order.findOne({
    $or: [{ _id: isObjectId ? idParam : null }, { orderId: idParam }]
  });
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const isObjectId = typeof req.params.id === 'string' && /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const order = await Order.findOne({
      $or: [{ _id: isObjectId ? req.params.id : null }, { orderId: req.params.id }]
    }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order delivery status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await findOrderByIdOrString(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status || order.orderStatus;
    if (DELIVERY_STEPS.includes(status)) {
      order.currentStepIndex = DELIVERY_STEPS.indexOf(status);
    }

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    await order.save();
    res.json({ success: true, message: `Order status updated to ${order.orderStatus}`, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Order (Customer before 'Preparing Food')
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await findOrderByIdOrString(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const uncancellableStatuses = ['Preparing Food', 'Packed', 'Out For Delivery', 'Near Your Location', 'Delivered'];
    if (uncancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled once food preparation has started or order is dispatched.'
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate HTML / PDF Invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.getInvoice = async (req, res, next) => {
  try {
    const order = await findOrderByIdOrString(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const invoiceHTML = generateInvoiceHTML(order);
    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHTML);
  } catch (error) {
    next(error);
  }
};
