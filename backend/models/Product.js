const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true
    },
    slug: String,
    category: {
      type: String,
      required: [true, 'Please specify category']
    },
    brand: {
      type: String,
      required: [true, 'Please specify brand']
    },
    price: {
      type: Number,
      required: [true, 'Please add original price']
    },
    discountPrice: {
      type: Number,
      required: [true, 'Please add discount price']
    },
    unit: {
      type: String,
      default: '1 lb'
    },
    stock: {
      type: Number,
      default: 50
    },
    rating: {
      type: Number,
      default: 4.5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    availability: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Limited Stock'],
      default: 'In Stock'
    },
    badge: {
      type: String,
      default: ''
    },
    isOrganic: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isFlashSale: {
      type: Boolean,
      default: false
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL']
    },
    images: [String],
    description: {
      type: String,
      required: [true, 'Please add product description']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
