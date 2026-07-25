const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a promo coupon code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percent', 'fixed', 'shipping'],
      default: 'percent'
    },
    discountValue: {
      type: Number,
      required: true
    },
    minOrderValue: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 100
    },
    validUntil: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000)
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', OfferSchema);
