const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Offer = require('../models/Offer');
const Review = require('../models/Review');
const generateToken = require('../utils/generateToken');

const DELIVERY_STEPS = [
  'Order Placed',
  'Order Confirmed',
  'Preparing Food',
  'Packed',
  'Out For Delivery',
  'Near Your Location',
  'Delivered'
];

// @desc    Admin Login Portal
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Ensure role is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin credentials required.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Admin authenticated successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Order Placed', 'Order Confirmed'] } });
    const preparingOrders = await Order.countDocuments({ orderStatus: { $in: ['Preparing Food', 'Packed'] } });
    const outForDelivery = await Order.countDocuments({ orderStatus: { $in: ['Out For Delivery', 'Near Your Location'] } });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totals?.grandTotal || 0), 0);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email');
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } });

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        preparingOrders,
        outForDelivery,
        deliveredOrders,
        cancelledOrders,
        totalUsers,
        totalProducts,
        totalCategories,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Orders (Admin View)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email phone');
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Delivery Status (Next Step / Prev Step / Deliver / Cancel)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { action, targetStatus, assignedPerson } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (assignedPerson) {
      order.assignedDeliveryPerson = {
        name: assignedPerson.name || order.assignedDeliveryPerson.name,
        phone: assignedPerson.phone || order.assignedDeliveryPerson.phone,
        vehicle: assignedPerson.vehicle || order.assignedDeliveryPerson.vehicle
      };
    }

    let currentIndex = DELIVERY_STEPS.indexOf(order.orderStatus);

    if (action === 'NEXT') {
      if (currentIndex < DELIVERY_STEPS.length - 1 && order.orderStatus !== 'Cancelled') {
        currentIndex += 1;
        order.orderStatus = DELIVERY_STEPS[currentIndex];
        order.currentStepIndex = currentIndex;
      }
    } else if (action === 'PREV') {
      if (currentIndex > 0 && order.orderStatus !== 'Cancelled') {
        currentIndex -= 1;
        order.orderStatus = DELIVERY_STEPS[currentIndex];
        order.currentStepIndex = currentIndex;
      }
    } else if (action === 'DELIVER') {
      order.orderStatus = 'Delivered';
      order.currentStepIndex = 6;
      order.paymentStatus = 'Paid';
    } else if (action === 'CANCEL') {
      order.orderStatus = 'Cancelled';
    } else if (targetStatus && DELIVERY_STEPS.includes(targetStatus)) {
      order.orderStatus = targetStatus;
      order.currentStepIndex = DELIVERY_STEPS.indexOf(targetStatus);
    }

    // Add entry to tracking timeline
    order.trackingTimeline.push({
      stepName: order.orderStatus,
      status: order.orderStatus,
      time: new Date(),
      completed: true,
      note: `Status updated by Admin to ${order.orderStatus}`
    });

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${order.orderStatus}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Customer list)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Product Management (Add, Edit, Delete)
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Category Management
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
