import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const showcaseImages = [
  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=900&q=80",
];

const categoryStory = [
  {
    title: "Fresh Chicken Cuts",
    body: "Whole birds, curry cuts, boneless fillets, and marinated packs for daily family orders.",
  },
  {
    title: "Egg Supply",
    body: "Retail trays and subscription-friendly egg supply for households, cafes, and hostels.",
  },
  {
    title: "Bulk Orders",
    body: "Restaurants and resellers can place repeat requests with profile-linked delivery details.",
  },
];

const trustCards = [
  { title: "Cold-chain handling", text: "Packing and dispatch notes are preserved in each order request." },
  { title: "Admin-led pricing", text: "Rates for meat, eggs, and packs can be changed live from the admin panel." },
  { title: "Buyer accounts", text: "Customers can edit profile data, reuse delivery addresses, and track order status." },
];

const paymentCards = [
  {
    title: "Cash on Delivery",
    text: "Best for household orders that want quick doorstep payment confirmation.",
  },
  {
    title: "UPI Requests",
    text: "Customers can choose UPI during checkout and the admin can confirm payment status after collection.",
  },
  {
    title: "Card / Bank Transfer",
    text: "Prepared for premium payment workflows today and live gateway integration later.",
  },
];

const testimonials = [
  {
    quote: "The site now feels like an actual food commerce brand, not just a product list.",
    author: "Restaurant buyer workflow",
  },
  {
    quote: "Customers can place buy-now requests instantly and the admin gets notified with full details.",
    author: "Direct order operations",
  },
  {
    quote: "Rate changes for chicken and eggs show up directly in the storefront without extra work.",
    author: "Market pricing control",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartNotice, setCartNotice] = useState("");

  useEffect(() => {
    axios
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );
    return ["All", ...uniqueCategories];
  }, [products]);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured).slice(0, 3),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        [product.name, product.category, product.badge, product.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, searchQuery]);

  const highlightedProducts =
    activeCategory === "All" && !searchQuery && featuredProducts.length ? featuredProducts : filteredProducts;

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find((item) => item.productId === product._id);

    const updatedCart = existingItem
      ? existingCart.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [
          ...existingCart,
          {
            productId: product._id,
            name: product.name,
            quantity: 1,
            price: product.price,
            image: product.image,
            unit: product.unit,
          },
        ];

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
    setCartNotice(`${product.name} added to cart.`);
  };

  const buyNow = (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem(
      "checkoutNow",
      JSON.stringify([
        {
          productId: product._id,
          name: product.name,
          quantity: 1,
          price: product.price,
          image: product.image,
          unit: product.unit,
        },
      ])
    );
    navigate("/cart");
  };

  return (
    <div className="market-home">
      <section className="hero-band" id="home">
        <div className="hero-copy">
          <p className="eyebrow">Farm to doorstep poultry commerce</p>
          <h1>Fresh chicken, eggs, cuts, and farm essentials with a real buying flow.</h1>
          <p className="hero-text">
            A market-ready poultry storefront with product discovery, customer accounts, admin
            control, order requests, payment selection, and profile-linked delivery handling.
          </p>
          <div className="hero-actions">
            <a href="#catalog" className="primary-link">
              Shop Fresh Stock
            </a>
            <a href="#delivery" className="ghost-link">
              Explore Buyer Journey
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{products.length || "Live"}</strong>
              <span>Product slots</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Payment request modes</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Admin visibility</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card hero-card-main">
            <img src={showcaseImages[0]} alt="Fresh poultry selection" />
          </div>
          <div className="hero-card hero-card-side">
            <img src={showcaseImages[1]} alt="Egg and poultry farm preparation" />
          </div>
          <div className="hero-note">
            <span>Trusted Supply Window</span>
            <strong>Today 6 AM to 8 PM</strong>
            <p>Same-day handling for premium cuts, eggs, and scheduled bulk requests.</p>
          </div>
        </div>
      </section>

      <section className="info-grid" id="why-us">
        {trustCards.map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="story-panel">
        <div className="story-copy">
          <p className="eyebrow">About the farm</p>
          <h2>Built for a real poultry business, not just a demo catalog.</h2>
          <p>
            Salunkhe Poultry Market now positions your business like a modern food brand with richer
            product storytelling, category browsing, order capture, customer accounts, and a
            back-office workspace for handling rates, orders, and notifications.
          </p>
          <ul className="feature-list">
            <li>Fresh whole chicken, cleaned cuts, eggs, and value packs</li>
            <li>Customer accounts with address, phone, avatar, and repeat-order convenience</li>
            <li>Admin review workflow for order status, pricing, and low-stock monitoring</li>
          </ul>
        </div>
        <div className="story-media">
          <img src={showcaseImages[2]} alt="Poultry farm delivery preparation" />
        </div>
      </section>

      <section className="category-band">
        {categoryStory.map((item) => (
          <article className="category-story-card" key={item.title}>
            <p className="eyebrow">Category</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Live catalog</p>
            <h2>Available Products</h2>
          </div>
          <p>
            The storefront is connected to MongoDB products, so admin updates reflect here
            automatically.
          </p>
        </div>

        <div className="catalog-toolbar">
          <div className="catalog-search">
            <label htmlFor="catalog-search">Search products</label>
            <input
              id="catalog-search"
              className="form-input"
              placeholder="Search chicken, eggs, trays, curry cuts..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="catalog-filters">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`filter-chip ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {cartNotice ? <p className="form-info">{cartNotice}</p> : null}

        {loading ? (
          <div className="empty-state">Loading product inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            No products match the current search. Try another category or add inventory from the
            admin panel.
          </div>
        ) : (
          <div className="product-grid-modern">
            {highlightedProducts.map((product) => (
              <article className="product-card-modern" key={product._id}>
                <div className="product-image-wrap">
                  <img
                    src={
                      product.image ||
                      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={product.name}
                  />
                  <span className="product-badge">{product.badge || product.category}</span>
                </div>
                <div className="product-content">
                  <div className="product-header-row">
                    <h3>{product.name}</h3>
                    <span>{product.stock} in stock</span>
                  </div>
                  <p>{product.description || "Freshly prepared poultry item ready for dispatch."}</p>
                  <div className="product-meta">
                    <strong>Rs. {product.price}</strong>
                    <small>{product.unit || "per kg"}</small>
                  </div>
                  <div className="product-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => buyNow(product)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="delivery-strip" id="delivery">
        <div>
          <p className="eyebrow">Customer experience</p>
          <h2>What the buyer journey supports now</h2>
        </div>
        <div className="timeline-grid">
          <article>
            <span>01</span>
            <h4>Create account and save profile</h4>
            <p>Customers keep delivery details ready for faster checkout and repeat purchases.</p>
          </article>
          <article>
            <span>02</span>
            <h4>Add to cart or buy now</h4>
            <p>Users can build a basket or trigger an instant purchase request for one product.</p>
          </article>
          <article>
            <span>03</span>
            <h4>Admin receives the request</h4>
            <p>Incoming orders are visible in the admin workspace with customer and payment data.</p>
          </article>
          <article>
            <span>04</span>
            <h4>Notifications stay visible</h4>
            <p>Users can review order progress and notification updates from their profile panel.</p>
          </article>
        </div>
      </section>

      <section className="payments-strip" id="payments">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Payment experience</p>
            <h2>Ready for COD, UPI, card, and transfer-based order requests</h2>
          </div>
          <p>
            The current platform captures payment preference and admin-side order review. A live
            gateway can be plugged in next with Razorpay or Stripe credentials.
          </p>
        </div>
        <div className="payments-grid">
          {paymentCards.map((card) => (
            <article className="panel payment-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonials-grid">
        {testimonials.map((item) => (
          <article className="panel testimonial-card" key={item.author}>
            <p>"{item.quote}"</p>
            <strong>{item.author}</strong>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Home;
