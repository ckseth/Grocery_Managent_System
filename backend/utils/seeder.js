const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Offer = require('../models/Offer');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const CATEGORIES = [
  { categoryId: "vegetables", name: "Organic Vegetables", slug: "vegetables", icon: "bi-flower1", count: 12 },
  { categoryId: "fruits", name: "Fresh Fruits", slug: "fruits", icon: "bi-apple", count: 10 },
  { categoryId: "dairy", name: "Dairy & Eggs", slug: "dairy", icon: "bi-egg-fried", count: 8 },
  { categoryId: "bakery", name: "Fresh Bakery", slug: "bakery", icon: "bi-cup-hot", count: 6 },
  { categoryId: "beverages", name: "Cold Beverages", slug: "beverages", icon: "bi-cup-straw", count: 6 },
  { categoryId: "meat", name: "Meat & Seafood", slug: "meat", icon: "bi-slash-circle", count: 4 },
  { categoryId: "snacks", name: "Snacks & Munchies", slug: "snacks", icon: "bi-box-seam", count: 4 },
  { categoryId: "pantry", name: "Pantry Staples", slug: "pantry", icon: "bi-basket", count: 2 }
];

const OFFERS = [
  { code: "FRESH20", title: "20% OFF Entire Order", description: "Get 20% discount on all items", discountType: "percent", discountValue: 20 },
  { code: "GROCERY10", title: "$10 OFF Orders > $30", description: "$10 flat discount on orders over $30", discountType: "fixed", discountValue: 10, minOrderValue: 30 },
  { code: "FREESHIP", title: "Free Express Shipping", description: "Waive all delivery fees", discountType: "shipping", discountValue: 100 }
];

const seedData = async () => {
  try {
    await Category.deleteMany();
    await Offer.deleteMany();

    await Category.insertMany(CATEGORIES);
    await Offer.insertMany(OFFERS);

    console.log('Categories and Offers Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
