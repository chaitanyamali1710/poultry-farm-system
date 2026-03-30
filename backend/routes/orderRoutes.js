const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// ✅ PLACE ORDER (USER)
router.post("/", async (req, res) => {
  try {
    const { userId, products, totalPrice } = req.body;

    const order = new Order({
      userId,
      products,
      totalPrice
    });

    await order.save();
    res.json({ message: "Order placed successfully", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ORDERS BY USER
router.get("/user/:id", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL ORDERS (ADMIN)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
