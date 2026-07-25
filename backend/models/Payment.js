const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentGateway: {
      type: String,
      enum: ['COD', 'Stripe', 'Razorpay'],
      default: 'COD'
    },
    status: {
      type: String,
      enum: ['Success', 'Failed', 'Pending'],
      default: 'Success'
    },
    rawResponse: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
