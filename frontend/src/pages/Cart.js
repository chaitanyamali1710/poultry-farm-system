import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post("/orders", {
        userId,
        products: cart,
        totalPrice
      });

      alert("Order placed successfully 🎉");
      localStorage.removeItem("cart");
      setCart([]);
    } catch (err) {
      console.error(err);
      alert("Order failed");
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div key={index}>
              <h5>{item.name}</h5>
              <p>₹{item.price} × {item.quantity}</p>
            </div>
          ))}

          <h3>Total: ₹{totalPrice}</h3>
          <button className="btn btn-success" onClick={placeOrder}>
            Place Order
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
