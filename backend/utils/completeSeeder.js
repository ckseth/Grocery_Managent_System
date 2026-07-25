const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const DeliveryAddress = require('../models/DeliveryAddress');
const Review = require('../models/Review');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocerygo');
    console.log('MongoDB Connected for Comprehensive Seeding...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Read sample JSON
    const samplePath = path.join(__dirname, '../data/sampleData.json');
    const rawData = fs.readFileSync(samplePath, 'utf8');
    const data = JSON.parse(rawData);

    // Clear existing data across all 15 collections
    await User.deleteMany();
    await Admin.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Offer.deleteMany();
    await Coupon.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Order.deleteMany();
    await Payment.deleteMany();
    await DeliveryAddress.deleteMany();
    await Review.deleteMany();
    await Inventory.deleteMany();
    await Notification.deleteMany();

    console.log('All existing collection data cleared.');

    // Seed Categories, Brands, Offers, Coupons, Products
    await Category.insertMany(data.categories);
    await Brand.insertMany(data.brands);
    await Offer.insertMany(data.offers);
    await Coupon.insertMany(data.coupons);
    const createdProducts = await Product.insertMany(data.products);

    // Create Sample Admin
    const admin = await Admin.create({
      name: 'Super Admin Manager',
      email: 'admin@grocerygo.com',
      password: 'adminpassword123',
      adminCode: 'ADM-SUPER-2026',
      accessLevel: 'superadmin'
    });

    // Create Sample Customer User
    const customer = await User.create({
      name: 'Sarah Miller',
      email: 'sarah.miller@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 234-5678'
    });

    // Create Inventory Records for products
    for (const prod of createdProducts) {
      await Inventory.create({
        product: prod._id,
        sku: `SKU-${prod.productId.toUpperCase()}`,
        currentStock: prod.stock,
        lowStockThreshold: 10,
        batchNumber: `BATCH-${Date.now().toString().slice(-6)}`
      });
    }

    // Create Sample Customer Address
    const address = await DeliveryAddress.create({
      user: customer._id,
      name: 'Sarah Miller',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'Oregon',
      zip: '97477',
      phone: '+1 (555) 234-5678',
      isDefault: true
    });

    customer.addresses.push({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      phone: address.phone,
      isDefault: true
    });
    await customer.save();

    // Create Sample Cart & Wishlist
    await Cart.create({
      user: customer._id,
      items: [
        {
          product: createdProducts[0]._id,
          productId: createdProducts[0].productId,
          name: createdProducts[0].name,
          price: createdProducts[0].discountPrice,
          image: createdProducts[0].image,
          unit: createdProducts[0].unit,
          quantity: 2
        }
      ],
      subtotal: createdProducts[0].discountPrice * 2,
      tax: (createdProducts[0].discountPrice * 2) * 0.05,
      deliveryFee: 0.00,
      grandTotal: (createdProducts[0].discountPrice * 2) * 1.05
    });

    await Wishlist.create({
      user: customer._id,
      products: [createdProducts[1]._id, createdProducts[2]._id]
    });

    // Create Sample Order & Payment
    const order = await Order.create({
      orderId: 'GO-892104',
      user: customer._id,
      items: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          price: createdProducts[0].discountPrice,
          quantity: 2,
          image: createdProducts[0].image,
          unit: createdProducts[0].unit
        }
      ],
      shippingAddress: {
        name: address.name,
        address: address.address,
        city: address.city,
        state: address.state,
        zip: address.zip
      },
      paymentMethod: 'Credit Card (•••• 8921)',
      paymentStatus: 'Paid',
      orderStatus: 'Out for Delivery',
      totals: {
        subtotal: 5.58,
        tax: 0.28,
        deliveryFee: 0.00,
        discountAmount: 0.00,
        grandTotal: 5.86
      },
      trackingTimeline: [
        { status: 'Order Placed', time: new Date(Date.now() - 3600000), completed: true },
        { status: 'Packed', time: new Date(Date.now() - 1800000), completed: true },
        { status: 'Out for Delivery', time: new Date(), completed: true },
        { status: 'Delivered', time: null, completed: false }
      ]
    });

    await Payment.create({
      transactionId: `TXN-${Date.now()}`,
      order: order._id,
      user: customer._id,
      amount: order.totals.grandTotal,
      paymentGateway: 'Stripe',
      status: 'Success'
    });

    // Create Sample Review
    await Review.create({
      product: createdProducts[0]._id,
      user: customer._id,
      userName: customer.name,
      rating: 5,
      comment: 'Super fresh broccoli! Arrived in under 30 minutes in great condition.'
    });

    // Create Sample Notification
    await Notification.create({
      user: customer._id,
      type: 'OrderUpdate',
      title: 'Order Out For Delivery',
      message: 'Your order #GO-892104 is on the way with Alex Rivera.'
    });

    console.log('SUCCESS: All 15 Collections Successfully Seeded in MongoDB!');
    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

importData();
