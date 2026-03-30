const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: "Farm Fresh"
  },
  description: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: "per kg"
  },
  stock: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  badge: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
