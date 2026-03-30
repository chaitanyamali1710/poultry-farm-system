const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// TEST ROUTE (VERY IMPORTANT)
router.get("/test", (req, res) => {
  res.send("Product route working");
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD PRODUCT
router.post("/", async (req, res) => {
  try {
    const { name, price, stock, image } = req.body;

    const product = new Product({ name, price, stock, image });
    await product.save();

    res.json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
