const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add coupon code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed', 'shipping'],
      default: 'percent'
    },
    discountValue: {
      type: Number,
      required: true,
      default: 10
    },
    discountPercentage: {
      type: Number
    },
    minOrderValue: {
      type: Number,
      default: 0
    },
    expiryDate: {
      type: Date
    },
    usageLimit: {
      type: Number,
      default: 1000
    },
    usedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', CouponSchema);
