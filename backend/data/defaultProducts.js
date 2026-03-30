const defaultProducts = [
  {
    name: "Broiler Chicken Curry Cut",
    category: "Fresh Chicken",
    description: "Fresh curry-cut broiler chicken cleaned and packed for family meals.",
    badge: "Best Seller",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=80",
    pricingOptions: [
      { label: "500 g pack", weight: 0.5, unit: "kg", price: 140, stock: 40 },
      { label: "1 kg pack", weight: 1, unit: "kg", price: 270, stock: 30 },
      { label: "2 kg family pack", weight: 2, unit: "kg", price: 520, stock: 18 }
    ]
  },
  {
    name: "Boneless Chicken Breast",
    category: "Premium Cuts",
    description: "Tender boneless breast pieces ideal for grilling, protein meals, and quick cooking.",
    badge: "High Protein",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=1200&q=80",
    pricingOptions: [
      { label: "500 g pack", weight: 0.5, unit: "kg", price: 165, stock: 24 },
      { label: "1 kg pack", weight: 1, unit: "kg", price: 320, stock: 18 }
    ]
  },
  {
    name: "Chicken Drumsticks",
    category: "Fresh Chicken",
    description: "Juicy drumsticks packed fresh for fry, roast, and tandoori orders.",
    badge: "Weekend Pick",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1200&q=80",
    pricingOptions: [
      { label: "500 g pack", weight: 0.5, unit: "kg", price: 155, stock: 20 },
      { label: "1 kg pack", weight: 1, unit: "kg", price: 300, stock: 14 }
    ]
  },
  {
    name: "Country Chicken Whole",
    category: "Country Chicken",
    description: "Native-style whole country chicken for premium home cooking and festive demand.",
    badge: "Farm Fresh",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1200&q=80",
    pricingOptions: [
      { label: "1 kg approx", weight: 1, unit: "kg", price: 420, stock: 12 },
      { label: "1.5 kg approx", weight: 1.5, unit: "kg", price: 610, stock: 10 }
    ]
  },
  {
    name: "Farm Eggs Tray",
    category: "Eggs",
    description: "Fresh brown eggs sorted and packed for daily home and hostel supply.",
    badge: "Daily Need",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80",
    pricingOptions: [
      { label: "6 eggs", weight: 6, unit: "pcs", price: 42, stock: 60 },
      { label: "12 eggs", weight: 12, unit: "pcs", price: 84, stock: 45 },
      { label: "30 eggs tray", weight: 30, unit: "pcs", price: 205, stock: 25 }
    ]
  },
  {
    name: "Bulk Kitchen Supply Pack",
    category: "Bulk Orders",
    description: "Restaurant-ready chicken supply with predictable pricing and stock visibility.",
    badge: "Restaurant",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80",
    pricingOptions: [
      { label: "5 kg pack", weight: 5, unit: "kg", price: 1250, stock: 10 },
      { label: "10 kg pack", weight: 10, unit: "kg", price: 2450, stock: 6 }
    ]
  }
];

module.exports = defaultProducts;
