const express = require("express");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { products, totalPrice, paymentMethod, note, orderType } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "At least one product is required" });
    }

    const order = new Order({
      userId: req.user._id,
      products,
      totalPrice,
      paymentMethod,
      note,
      orderType,
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      deliveryAddress: {
        address: req.user.address,
        city: req.user.city,
        state: req.user.state,
        pincode: req.user.pincode
      }
    });

    await order.save();

    await Notification.create({
      title: "New order received",
      message: `${req.user.name} placed a ${order.orderType} order for Rs. ${order.totalPrice}.`,
      type: "order",
      audience: "admin",
      referenceId: order._id
    });

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) {
      order.status = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    await Notification.create({
      title: "Order updated",
      message: `Your order ${order._id.toString().slice(-6)} is now ${order.status}.`,
      type: "order",
      audience: "user",
      recipient: order.userId,
      referenceId: order._id
    });

    res.json({ message: "Order updated successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
