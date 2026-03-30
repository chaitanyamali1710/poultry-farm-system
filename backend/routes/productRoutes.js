const express = require("express");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const normalizePricingOptions = (pricingOptions = [], fallback = {}) => {
  if (Array.isArray(pricingOptions) && pricingOptions.length) {
    return pricingOptions
      .map((option) => ({
        label: option.label,
        weight: Number(option.weight) || 0,
        unit: option.unit || "kg",
        price: Number(option.price) || 0,
        stock: Number(option.stock) || 0
      }))
      .filter((option) => option.label && option.price > 0);
  }

  if (fallback.price) {
    return [
      {
        label: fallback.label || fallback.unit || "Standard pack",
        weight: Number(fallback.weight) || 0,
        unit: fallback.unit || "kg",
        price: Number(fallback.price) || 0,
        stock: Number(fallback.stock) || 0
      }
    ];
  }

  return [];
};

const normalizeProductPayload = (body) => {
  const pricingOptions = normalizePricingOptions(body.pricingOptions, {
    price: body.price,
    stock: body.stock,
    unit: body.unit
  });
  const primaryOption = pricingOptions[0];

  return {
    name: body.name,
    category: body.category,
    description: body.description,
    image: body.image,
    featured: Boolean(body.featured),
    badge: body.badge,
    pricingOptions,
    price: primaryOption?.price || Number(body.price) || 0,
    stock:
      pricingOptions.reduce((sum, option) => sum + (Number(option.stock) || 0), 0) ||
      Number(body.stock) ||
      0,
    unit: primaryOption ? `${primaryOption.label} | ${primaryOption.unit}` : body.unit || "per kg"
  };
};

// TEST ROUTE (VERY IMPORTANT)
router.get("/test", (req, res) => {
  res.send("Product route working");
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ featured: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD PRODUCT
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const product = new Product(normalizeProductPayload(req.body));
    await product.save();

    res.json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, normalizeProductPayload(req.body), {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
