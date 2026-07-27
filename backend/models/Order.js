const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        unit: String
      }
    ],
    shippingAddress: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      notes: String
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Paid'
    },
    paymentDetails: Object,
    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Order Confirmed',
        'Preparing Food',
        'Processing',
        'Packed',
        'Out For Delivery',
        'Out for Delivery',
        'Near Your Location',
        'Delivered',
        'Cancelled'
      ],
      default: 'Order Placed'
    },
    currentStepIndex: {
      type: Number,
      default: 0
    },
    assignedDeliveryPerson: {
      name: { type: String, default: 'Alex Morgan' },
      phone: { type: String, default: '+1 (555) 234-5678' },
      vehicle: { type: String, default: 'Eco-Express Scooter' }
    },
    totals: {
      subtotal: Number,
      tax: Number,
      deliveryFee: Number,
      discountAmount: Number,
      grandTotal: Number,
      appliedCoupon: String
    },
    estimatedDelivery: {
      type: String,
      default: 'Today, within 10 mins'
    },
    trackingTimeline: [
      {
        stepName: String,
        status: String,
        time: Date,
        completed: Boolean,
        note: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
