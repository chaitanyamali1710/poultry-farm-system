import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Available Products</h2>
      <div className="row">
        {products.map(p => (
          <div className="col-md-4 mb-3" key={p._id}>
            <div className="card">
              <img src={p.image || "https://via.placeholder.com/150"} className="card-img-top" alt={p.name} />
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">Price: ₹{p.price}</p>
                <p className="card-text">Stock: {p.stock}</p>
                <button className="btn btn-primary">Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
