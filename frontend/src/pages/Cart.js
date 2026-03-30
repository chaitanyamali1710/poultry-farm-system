import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

const paymentOptions = [
  {
    value: "cash-on-delivery",
    label: "Cash on Delivery",
    helper: "Place the order directly and pay when the delivery reaches you.",
  },
  {
    value: "upi",
    label: "UPI",
    helper: "Choose a UPI app like Google Pay or PhonePe before placing the order.",
  },
];

const upiApps = [
  { value: "google-pay", label: "Google Pay", scheme: "tez://upi/pay" },
  { value: "phonepe", label: "PhonePe", scheme: "phonepe://pay" },
];

const merchantUpiId = process.env.REACT_APP_UPI_ID || "chai17102005@oksbi";
const merchantName = process.env.REACT_APP_UPI_NAME || "Salunkhe Poultry";
const upiStartedKey = "upiPaymentStarted";
const upiConfirmedKey = "upiPaymentConfirmed";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [profile, setProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [selectedUpiApp, setSelectedUpiApp] = useState("google-pay");
  const [upiPaymentStarted, setUpiPaymentStarted] = useState(
    () => sessionStorage.getItem(upiStartedKey) === "true"
  );
  const [upiPaidConfirmed, setUpiPaidConfirmed] = useState(
    () => sessionStorage.getItem(upiConfirmedKey) === "true"
  );
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkoutNowRaw = localStorage.getItem("checkoutNow");
  const checkoutNow = useMemo(() => JSON.parse(checkoutNowRaw || "null"), [checkoutNowRaw]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(checkoutNow || storedCart);

    axios
      .get("/users/me")
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => console.error(err));
  }, [checkoutNow]);

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const selectedPayment = paymentOptions.find((option) => option.value === paymentMethod);
  const requiresUpiApp = paymentMethod === "upi";
  const upiPaymentLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: merchantUpiId,
      pn: merchantName,
      am: String(totalPrice),
      cu: "INR",
      tn: checkoutNow ? "Buy now order" : "Cart order",
    });

    return `upi://pay?${params.toString()}`;
  }, [checkoutNow, totalPrice]);
  const upiQrCodeUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        upiPaymentLink
      )}`,
    [upiPaymentLink]
  );

  useEffect(() => {
    sessionStorage.setItem(upiStartedKey, String(upiPaymentStarted));
  }, [upiPaymentStarted]);

  useEffect(() => {
    sessionStorage.setItem(upiConfirmedKey, String(upiPaidConfirmed));
  }, [upiPaidConfirmed]);

  useEffect(() => {
    if (paymentMethod !== "upi") {
      setUpiPaymentStarted(false);
      setUpiPaidConfirmed(false);
    }
  }, [paymentMethod]);

  const openUpiApp = () => {
    const selectedApp = upiApps.find((app) => app.value === selectedUpiApp);

    if (!selectedApp) {
      setMessage("Please choose a UPI app before continuing.");
      return;
    }

    const deepLink = upiPaymentLink.replace("upi://pay", selectedApp.scheme);
    setUpiPaymentStarted(true);
    setUpiPaidConfirmed(false);
    setMessage("Complete the payment in your UPI app, then return here and confirm it.");
    window.location.href = deepLink;
  };

  const confirmUpiPayment = () => {
    setUpiPaymentStarted(true);
    setUpiPaidConfirmed(true);
    setMessage("Payment marked as completed. You can now place your order.");
  };

  const persistCart = (items) => {
    setCart(items);
    if (!checkoutNow) {
      localStorage.setItem("cart", JSON.stringify(items));
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const updateQuantity = (cartKey, delta) => {
    const updated = cart.map((item) =>
      (item.cartKey || item.productId) === cartKey
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );

    persistCart(updated);
  };

  const removeItem = (cartKey) => {
    const updated = cart.filter((item) => (item.cartKey || item.productId) !== cartKey);
    persistCart(updated);
  };

  const placeOrder = async () => {
    setMessage("");

    if (!profile?.address || !profile?.city || !profile?.pincode) {
      setMessage("Please complete your profile address before placing an order.");
      return;
    }

    if (!paymentMethod) {
      setMessage("Please select a payment method before placing the order.");
      return;
    }

    if (requiresUpiApp && !selectedUpiApp) {
      setMessage("Please select a UPI app before placing the order.");
      return;
    }

    if (requiresUpiApp && !upiPaidConfirmed) {
      setMessage("Please complete your UPI payment and confirm it before placing the order.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post("/orders", {
        products: cart,
        totalPrice,
        paymentMethod,
        note: [
          note,
          requiresUpiApp ? `UPI App: ${selectedUpiApp}` : "",
          requiresUpiApp ? "UPI Payment: customer confirmed paid" : "",
        ]
          .filter(Boolean)
          .join(" | "),
        orderType: checkoutNow ? "buy-now" : "cart",
      });

      setMessage("Order request sent successfully. Admin has been notified.");
      localStorage.removeItem("checkoutNow");
      if (!checkoutNow) {
        localStorage.removeItem("cart");
      }
      window.dispatchEvent(new Event("cart-updated"));
      setCart([]);
      setCheckoutStep("cart");
      setSelectedUpiApp("google-pay");
      setPaymentMethod("");
      setUpiPaymentStarted(false);
      setUpiPaidConfirmed(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedToPayment = () => {
    setMessage("");

    if (!cart.length) {
      return;
    }

    if (!profile?.address || !profile?.city || !profile?.pincode) {
      setMessage("Please complete your profile address before continuing to payment.");
      return;
    }

    setCheckoutStep("payment");
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
                <div className="cart-item" key={item.cartKey || item.productId}>
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
                      Rs. {item.price} {item.variantLabel ? `| ${item.variantLabel}` : item.unit ? `| ${item.unit}` : ""}
                    </p>
                    <div className="quantity-strip">
                      <button type="button" onClick={() => updateQuantity(item.cartKey || item.productId, -1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.cartKey || item.productId, 1)}>
                        +
                      </button>
                      <button type="button" className="remove-link" onClick={() => removeItem(item.cartKey || item.productId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length && checkoutStep === "payment" ? (
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

              {paymentMethod === "upi" ? (
                <div className="summary-block">
                  <label>Choose your UPI app</label>
                  <div className="payments-grid compact-grid upi-app-grid">
                    {upiApps.map((app) => (
                      <button
                        type="button"
                        key={app.value}
                        className={`payment-choice ${selectedUpiApp === app.value ? "active" : ""}`}
                        onClick={() => setSelectedUpiApp(app.value)}
                      >
                        <strong>{app.label}</strong>
                        <span>Tap to continue with {app.label}.</span>
                      </button>
                    ))}
                  </div>

                  <button type="button" className="secondary-button upi-launch-button" onClick={openUpiApp}>
                    Open {upiApps.find((app) => app.value === selectedUpiApp)?.label || "UPI App"}
                  </button>
                  <p className="muted-copy compact">
                    On supported phones this opens your selected UPI app. After payment, return here
                    and place the order.
                  </p>
                  <div className="upi-qr-card">
                    <img src={upiQrCodeUrl} alt="UPI payment QR code" className="upi-qr-image" />
                    <div>
                      <strong>QR fallback</strong>
                      <p className="muted-copy compact">
                        If the app does not open, scan this QR code with any UPI app and then come
                        back here.
                      </p>
                    </div>
                  </div>
                  {upiPaymentStarted ? (
                    <button
                      type="button"
                      className={`primary-button form-button ${upiPaidConfirmed ? "is-confirmed" : ""}`}
                      onClick={confirmUpiPayment}
                    >
                      {upiPaidConfirmed ? "Payment Confirmed" : "I Have Paid"}
                    </button>
                  ) : null}
                  {upiPaidConfirmed ? (
                    <p className="form-info compact">
                      UPI payment confirmed. You can now place the order.
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="muted-copy compact">
                  Cash on delivery will skip the online payment app step and place the order
                  directly.
                </p>
              )}
            </div>
          ) : null}
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
              <strong>{selectedPayment?.label || "Choose payment method"}</strong>
            </p>
            {selectedPayment?.helper ? <p className="muted-copy">{selectedPayment.helper}</p> : null}
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
          {message ? <p className="form-info">{message}</p> : null}
          {checkoutStep === "cart" ? (
            <button
              type="button"
              className="primary-button form-button"
              disabled={!cart.length}
              onClick={proceedToPayment}
            >
              Proceed to Payment
            </button>
          ) : (
            <>
              <button
                type="button"
                className="secondary-button form-button"
                onClick={() => setCheckoutStep("cart")}
              >
                Back to Cart
              </button>
              <button
                type="button"
                className="primary-button form-button"
                disabled={!cart.length || isSubmitting}
                onClick={placeOrder}
              >
                {paymentMethod === "upi"
                  ? "Place Order"
                  : checkoutNow
                    ? "Place Buy Now Order"
                    : "Place Your Order"}
              </button>
            </>
          )}
        </aside>
      </div>
    </section>
  );
};

export default Cart;
