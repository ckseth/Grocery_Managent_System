const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true
    },
    sku: String,
    currentStock: {
      type: Number,
      required: true,
      default: 100
    },
    reservedStock: {
      type: Number,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    batchNumber: String,
    expiryDate: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', InventorySchema);
