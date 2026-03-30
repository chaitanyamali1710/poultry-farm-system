import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Footer from "../components/Footer";

const showcaseImages = [
  "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=900&q=80",
];

const productHighlights = [
  { title: "Fresh Eggs", text: "Farm-fresh eggs packed for homes, shops, and regular buyers." },
  { title: "Healthy Chicken", text: "Fresh broiler and country chicken prepared with quality handling." },
  { title: "Flexible Packs", text: "Different weights and rates for daily home and bulk needs." },
];

const shopTiming = [
  { label: "Morning", value: "6:00 AM - 11:00 AM" },
  { label: "Evening", value: "4:00 PM - 8:00 PM" },
  { label: "Bulk Orders", value: "Pre-book from profile or admin contact" },
];

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [actionMessage, setActionMessage] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleProductsUpdated = () => {
      loadProducts();
    };

    window.addEventListener("products-updated", handleProductsUpdated);

    return () => {
      window.removeEventListener("products-updated", handleProductsUpdated);
    };
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );
    return ["All", ...uniqueCategories];
  }, [products]);

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

  const getPricingOptions = (product) =>
    product.pricingOptions?.length
      ? product.pricingOptions
      : [
          {
            label: product.unit || "Standard",
            weight: 0,
            unit: "unit",
            price: product.price,
            stock: product.stock,
          },
        ];

  const updateSelectedOption = (productId, optionIndex) => {
    setSelectedOptions((current) => ({ ...current, [productId]: Number(optionIndex) }));
  };

  const buildCartItem = (product, selectedOption, optionIndex) => ({
    productId: product._id,
    cartKey: `${product._id}-${optionIndex}`,
    name: product.name,
    image: product.image,
    quantity: 1,
    price: selectedOption.price,
    variantLabel: selectedOption.label,
    weight: selectedOption.weight,
    unit: selectedOption.unit || product.unit,
  });

  const ensureAuthenticated = () => {
    if (localStorage.getItem("token")) {
      return true;
    }

    navigate("/login");
    return false;
  };

  const addToCart = (product, selectedOption, optionIndex) => {
    if (!ensureAuthenticated()) {
      return;
    }

    const newItem = buildCartItem(product, selectedOption, optionIndex);
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = existingCart.findIndex((item) => item.cartKey === newItem.cartKey);

    if (existingIndex >= 0) {
      existingCart[existingIndex] = {
        ...existingCart[existingIndex],
        quantity: existingCart[existingIndex].quantity + 1,
      };
    } else {
      existingCart.push(newItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    localStorage.removeItem("checkoutNow");
    window.dispatchEvent(new Event("cart-updated"));
    setActionMessage(`${product.name} added to cart.`);
  };

  const removeFromCart = (product, optionIndex) => {
    if (!ensureAuthenticated()) {
      return;
    }

    const cartKey = `${product._id}-${optionIndex}`;
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = existingCart.filter((item) => item.cartKey !== cartKey);

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
    setActionMessage(`${product.name} removed from cart.`);
  };

  const isInCart = (productId, optionIndex) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    return existingCart.some((item) => item.cartKey === `${productId}-${optionIndex}`);
  };

  const buyNow = (product, selectedOption, optionIndex) => {
    if (!ensureAuthenticated()) {
      return;
    }

    localStorage.setItem(
      "checkoutNow",
      JSON.stringify([buildCartItem(product, selectedOption, optionIndex)])
    );
    navigate("/cart");
  };

  return (
    <div className="market-home">
      <section className="hero-band" id="home">
        <div className="hero-copy">
          <p className="eyebrow">Salunkhe Poultry Farm</p>
          <h1>Farm-fresh eggs and healthy chicken for your daily needs.</h1>
          <p className="hero-text">
            We are a family-run poultry farm providing farm-fresh eggs and chicken directly to
            customers with quality handling and simple product browsing.
          </p>
          <div className="hero-actions">
            <a href="#products" className="primary-link">
              View Products
            </a>
            <a href="#about" className="ghost-link">
              About Us
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{products.length || "Live"}</strong>
              <span>Available products</span>
            </div>
            <div>
              <strong>Fresh</strong>
              <span>Daily stock</span>
            </div>
            <div>
              <strong>Family-run</strong>
              <span>Farm quality</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card hero-card-main">
            <img src={showcaseImages[0]} alt="Fresh poultry products" />
          </div>
          <div className="hero-card hero-card-side">
            <img src={showcaseImages[1]} alt="Poultry farm preparation" />
          </div>
          <div className="hero-note">
            <span>Fresh Supply</span>
            <strong>Eggs, chicken, and poultry feed</strong>
            <p>Simple local supply with direct farm quality and ready stock visibility.</p>
          </div>
        </div>
      </section>

      <section className="story-panel" id="about">
        <div className="story-copy">
          <p className="eyebrow">About Us</p>
          <h2>Trusted family farm with direct customer service.</h2>
          <p>
            We are a family-run poultry farm providing farm-fresh eggs and chicken directly to
            customers. Our farm ensures high quality and ethical poultry farming.
          </p>
          <p>
            We offer fresh eggs, broiler chickens, and organic poultry feed.
          </p>
        </div>
        <div className="story-media">
          <img src={showcaseImages[2]} alt="Family-run poultry farm" />
        </div>
      </section>

      <section className="info-grid" id="products">
        {productHighlights.map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="delivery-strip timing-section" id="timing">
        <div>
          <p className="eyebrow">Shop Timing</p>
          <h2>Shop Timing</h2>
        </div>
        <div className="timing-grid">
          {shopTiming.map((item, index) => (
            <article className="timing-card" key={item.label}>
              <span>{`0${index + 1}`}</span>
              <h4>{item.label}</h4>
              <p>{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="catalog-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Our Products</p>
            <h2>Available Products</h2>
          </div>
          <p>Fresh Eggs, Healthy Chicken, and simple pack-size pricing.</p>
        </div>

        {actionMessage ? <p className="form-info compact">{actionMessage}</p> : null}

        <div className="catalog-toolbar">
          <div className="catalog-search">
            <label htmlFor="catalog-search">Search products</label>
            <input
              id="catalog-search"
              className="form-input"
              placeholder="Search eggs, broiler chicken, feed..."
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

        {loading ? (
          <div className="empty-state">Loading product inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            No products match the current search. Add products from the admin panel if inventory is
            empty.
          </div>
        ) : (
          <div className="product-grid-modern">
            {filteredProducts.map((product) => {
              const pricingOptions = getPricingOptions(product);
              const selectedOptionIndex = selectedOptions[product._id] || 0;
              const selectedOption = pricingOptions[selectedOptionIndex] || pricingOptions[0];
              const selectedOptionInCart = isInCart(product._id, selectedOptionIndex);

              return (
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
                      <span>{selectedOption.stock} in stock</span>
                    </div>
                    <p>{product.description || "Fresh poultry product ready for sale."}</p>
                    <div className="summary-block">
                      <label htmlFor={`variant-${product._id}`}>Choose pack size</label>
                      <select
                        id={`variant-${product._id}`}
                        className="form-input"
                        value={selectedOptions[product._id] || 0}
                        onChange={(event) => updateSelectedOption(product._id, event.target.value)}
                      >
                        {pricingOptions.map((option, index) => (
                          <option key={`${product._id}-${option.label}`} value={index}>
                            {option.label} - Rs. {option.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="product-meta">
                      <strong>Rs. {selectedOption.price}</strong>
                      <small>{selectedOption.label}</small>
                    </div>
                    <div className="product-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => addToCart(product, selectedOption, selectedOptionIndex)}
                      >
                        Add to Cart
                      </button>
                      {selectedOptionInCart ? (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => removeFromCart(product, selectedOptionIndex)}
                        >
                          Remove from Cart
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => buyNow(product, selectedOption, selectedOptionIndex)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Home;
