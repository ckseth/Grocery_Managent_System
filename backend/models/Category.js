const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true
    },
    slug: String,
    description: String,
    image: String,
    icon: {
      type: String,
      default: 'bi-bag'
    },
    count: {
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

module.exports = mongoose.model('Category', CategorySchema);
