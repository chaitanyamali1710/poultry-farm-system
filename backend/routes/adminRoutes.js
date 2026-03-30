const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Notification = require("../models/Notification");
const defaultProducts = require("../data/defaultProducts");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", async (req, res) => {
  try {
    const [users, products, orders, pendingOrders, unreadNotifications, lowStockProducts, recentOrders] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: "pending" }),
        Notification.countDocuments({ audience: "admin", isRead: false }),
        Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(6),
        Order.find().populate("userId", "name").sort({ createdAt: -1 }).limit(6)
      ]);

    const revenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);

    res.json({
      metrics: {
        users,
        products,
        orders,
        pendingOrders,
        unreadNotifications,
        totalRevenue: revenue[0]?.totalRevenue || 0
      },
      lowStockProducts,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ audience: "admin" })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/seed-products", async (req, res) => {
  try {
    const existingProducts = await Product.find({}, "name");
    const existingNames = new Set(existingProducts.map((product) => product.name.toLowerCase()));

    const productsToInsert = defaultProducts
      .filter((product) => !existingNames.has(product.name.toLowerCase()))
      .map((product) => {
        const totalStock = product.pricingOptions.reduce((sum, option) => sum + option.stock, 0);

        return {
          ...product,
          price: product.pricingOptions[0]?.price || 0,
          stock: totalStock,
          unit: product.pricingOptions[0]?.label || "Standard"
        };
      });

    if (!productsToInsert.length) {
      return res.json({ message: "Starter catalog already available.", added: 0 });
    }

    await Product.insertMany(productsToInsert);

    res.json({
      message: `${productsToInsert.length} starter products added successfully.`,
      added: productsToInsert.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
