function ProductSection() {
  return (
    <section className="products">
      <h2>Available Products</h2>

      <div className="product-grid">
        <div className="product-card">
          <h3>Country Chicken</h3>
          <p>₹280 / kg</p>
          <button>Add to Cart</button>
        </div>

        <div className="product-card">
          <h3>Broiler Chicken</h3>
          <p>₹200 / kg</p>
          <button>Add to Cart</button>
        </div>

        <div className="product-card">
          <h3>Eggs (12 pcs)</h3>
          <p>₹90</p>
          <button>Add to Cart</button>
        </div>
      </div>
    </section>
  );
}

export default ProductSection;
