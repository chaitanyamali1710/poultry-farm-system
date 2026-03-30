import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

const paymentOptions = [
  {
    value: "cash-on-delivery",
    label: "Cash on Delivery",
    helper: "Best for doorstep settlement after delivery confirmation.",
  },
  {
    value: "upi",
    label: "UPI",
    helper: "Customer selects UPI and the admin can confirm collection/payment status.",
  },
  {
    value: "card",
    label: "Card",
    helper: "Prepared for a live gateway integration such as Razorpay or Stripe.",
  },
  {
    value: "bank-transfer",
    label: "Bank Transfer",
    helper: "Useful for large or restaurant orders that require invoice-style processing.",
  },
];

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [profile, setProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const checkoutNow = JSON.parse(localStorage.getItem("checkoutNow") || "null");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(checkoutNow || storedCart);

    axios
      .get("/users/me")
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err));
  }, [checkoutNow]);

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const selectedPayment = paymentOptions.find((option) => option.value === paymentMethod);

  const persistCart = (items) => {
    setCart(items);
    if (!checkoutNow) {
      localStorage.setItem("cart", JSON.stringify(items));
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const updateQuantity = (productId, delta) => {
    const updated = cart.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );

    persistCart(updated);
  };

  const removeItem = (productId) => {
    const updated = cart.filter((item) => item.productId !== productId);
    persistCart(updated);
  };

  const placeOrder = async () => {
    setMessage("");

    if (!profile?.address || !profile?.city || !profile?.pincode) {
      setMessage("Please complete your profile address before placing an order.");
      return;
    }

    try {
      await axios.post("/orders", {
        products: cart,
        totalPrice,
        paymentMethod,
        note,
        orderType: checkoutNow ? "buy-now" : "cart",
      });

      setMessage("Order request sent successfully. Admin has been notified.");
      localStorage.removeItem("checkoutNow");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));
      setCart([]);
    } catch (err) {
      setMessage(err.response?.data?.message || "Order failed. Please try again.");
    }
  };

  return (
    <section className="dashboard-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>{checkoutNow ? "Buy Now Request" : "Your Cart"}</h1>
        </div>
        <Link to="/profile" className="ghost-link">
          Edit profile
        </Link>
      </div>

      <div className="cart-layout">
        <div className="stack-layout">
          <div className="panel">
            {cart.length === 0 ? (
              <div className="empty-state">
                Your cart is empty. Add products from the home page to start shopping.
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={item.name}
                  />
                  <div className="cart-item-copy">
                    <div className="product-header-row">
                      <h3>{item.name}</h3>
                      <strong>Rs. {item.price * item.quantity}</strong>
                    </div>
                    <p>
                      Rs. {item.price} {item.unit ? `| ${item.unit}` : ""}
                    </p>
                    <div className="quantity-strip">
                      <button type="button" onClick={() => updateQuantity(item.productId, -1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, 1)}>
                        +
                      </button>
                      <button type="button" className="remove-link" onClick={() => removeItem(item.productId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="panel">
            <h2>Payment options</h2>
            <div className="payments-grid compact-grid">
              {paymentOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`payment-choice ${paymentMethod === option.value ? "active" : ""}`}
                  onClick={() => setPaymentMethod(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.helper}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="panel order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <strong>{cart.length}</strong>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <strong>Rs. {totalPrice}</strong>
          </div>
          <div className="summary-block">
            <label>Selected payment mode</label>
            <p className="muted-copy">
              <strong>{selectedPayment?.label}</strong>
            </p>
            <p className="muted-copy">{selectedPayment?.helper}</p>
          </div>
          <div className="summary-block">
            <label>Delivery note</label>
            <textarea
              className="form-input"
              rows="4"
              placeholder="Cut preference, packing note, delivery instructions..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="summary-block">
            <label>Delivery address</label>
            <p className="muted-copy">
              {profile?.address
                ? `${profile.address}, ${profile.city}, ${profile.state} - ${profile.pincode}`
                : "No saved address found yet."}
            </p>
          </div>
          <div className="summary-block">
            <label>Request type</label>
            <p className="muted-copy">
              {checkoutNow
                ? "Buy-now request will be sent directly to the admin panel."
                : "Cart order will be created and visible in the admin order queue."}
            </p>
          </div>
          {message ? <p className="form-info">{message}</p> : null}
          <button
            type="button"
            className="primary-button form-button"
            disabled={!cart.length}
            onClick={placeOrder}
          >
            {checkoutNow ? "Send Buy Now Request" : "Place Order"}
          </button>
        </aside>
      </div>
    </section>
  );
};

export default Cart;
