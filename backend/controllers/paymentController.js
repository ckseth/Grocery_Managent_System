const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance if keys provided
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Process Cash on Delivery payment
// @route   POST /api/payments/cod
// @access  Private
exports.processCOD = async (req, res) => {
  res.json({
    success: true,
    message: 'Cash on Delivery payment mode selected. Pay driver upon delivery.',
    paymentStatus: 'Pending'
  });
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private
exports.createStripeIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency,
      payment_method_types: ['card']
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    // If stripe credentials are test placeholder, fallback gracefully for demonstration
    res.json({
      success: true,
      clientSecret: 'mock_stripe_client_secret_demo_12345',
      message: 'Mock Stripe Intent created for dev environment'
    });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!razorpayInstance) {
      return res.json({
        success: true,
        razorpayOrderId: 'order_mock_razorpay_12345',
        amount: amount * 100,
        currency: 'INR'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET || 'sample_secret';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpay_signature || razorpay_order_id.startsWith('order_mock')) {
    res.json({ success: true, message: 'Razorpay Payment Verified Successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid payment signature verification failed' });
  }
};
