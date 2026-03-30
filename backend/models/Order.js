const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  orderType: {
    type: String,
    enum: ["cart", "buy-now"],
    default: "cart"
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["cash-on-delivery", "upi", "card", "bank-transfer"],
    default: "cash-on-delivery"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "packed", "out-for-delivery", "completed", "cancelled"],
    default: "pending"
  },
  note: {
    type: String,
    default: ""
  },
  customer: {
    name: String,
    email: String,
    phone: String
  },
  deliveryAddress: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
