import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    preferredPaymentMethod: "cash-on-delivery",
    password: "",
  });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [profileRes, ordersRes, notificationsRes] = await Promise.all([
        axios.get("/users/me"),
        axios.get("/orders/my"),
        axios.get("/notifications"),
      ]);

      setProfile((current) => ({
        ...current,
        ...profileRes.data,
        password: "",
      }));
      setOrders(ordersRes.data);
      setNotifications(notificationsRes.data);
      localStorage.setItem("user", JSON.stringify(profileRes.data));
      window.dispatchEvent(new Event("session-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const res = await axios.put("/users/me", profile);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("session-updated"));
      setProfile((current) => ({ ...current, password: "" }));
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Profile update failed.");
    }
  };

  const markNotificationRead = async (notificationId) => {
    await axios.patch(`/notifications/${notificationId}/read`);
    loadData();
  };

  const profileCompletion = useMemo(() => {
    const fields = [
      "name",
      "phone",
      "avatar",
      "address",
      "city",
      "state",
      "pincode",
      "preferredPaymentMethod",
    ];
    const completed = fields.filter((field) => profile[field]).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  return (
    <section className="dashboard-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">User panel</p>
          <h1>My Account</h1>
        </div>
        <p>Update your profile, review order history, and stay on top of delivery notifications.</p>
      </div>

      <div className="metric-grid profile-metrics">
        <article className="panel metric-card">
          <span>Profile completion</span>
          <strong>{profileCompletion}%</strong>
        </article>
        <article className="panel metric-card">
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </article>
        <article className="panel metric-card">
          <span>Unread notifications</span>
          <strong>{notifications.filter((notification) => !notification.isRead).length}</strong>
        </article>
        <article className="panel metric-card">
          <span>Saved city</span>
          <strong>{profile.city || "Add city"}</strong>
        </article>
      </div>

      <div className="profile-layout">
        <form className="panel profile-card" onSubmit={saveProfile}>
          <h2>Edit profile</h2>
          <div className="form-grid">
            <input className="form-input" name="name" value={profile.name} onChange={handleChange} placeholder="Name" />
            <input className="form-input" name="email" value={profile.email} disabled placeholder="Email" />
            <input className="form-input" name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone" />
            <input className="form-input" name="avatar" value={profile.avatar} onChange={handleChange} placeholder="Avatar URL" />
            <input className="form-input form-span" name="address" value={profile.address} onChange={handleChange} placeholder="Street address" />
            <input className="form-input" name="city" value={profile.city} onChange={handleChange} placeholder="City" />
            <input className="form-input" name="state" value={profile.state} onChange={handleChange} placeholder="State" />
            <input className="form-input" name="pincode" value={profile.pincode} onChange={handleChange} placeholder="Pincode" />
            <select
              className="form-input"
              name="preferredPaymentMethod"
              value={profile.preferredPaymentMethod}
              onChange={handleChange}
            >
              <option value="cash-on-delivery">Cash on Delivery</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank-transfer">Bank Transfer</option>
            </select>
            <input className="form-input form-span" name="password" type="password" value={profile.password} onChange={handleChange} placeholder="Set a new password if needed" />
          </div>
          {message ? <p className="form-info">{message}</p> : null}
          <button className="primary-button form-button">Save profile</button>
        </form>

        <div className="stack-layout">
          <div className="panel">
            <h2>My orders</h2>
            <div className="admin-list">
              {orders.length === 0 ? (
                <div className="empty-state">No orders yet. Place your first order from the home page.</div>
              ) : (
                orders.map((order) => (
                  <article className="order-card" key={order._id}>
                    <div className="order-card-top">
                      <div>
                        <h3>Order #{order._id.slice(-6)}</h3>
                        <p>
                          {order.orderType} | {order.paymentMethod}
                        </p>
                      </div>
                      <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </div>
                    <p className="muted-copy">Total: Rs. {order.totalPrice}</p>
                    {order.note ? <p className="muted-copy">Note: {order.note}</p> : null}
                    <ul className="feature-list">
                      {order.products.map((item, index) => (
                        <li key={`${order._id}-${index}`}>
                          {item.name} {item.variantLabel ? `(${item.variantLabel})` : ""} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <h2>Saved payment preference</h2>
            <p className="muted-copy">
              Default mode: <strong>{profile.preferredPaymentMethod.replace(/-/g, " ")}</strong>
            </p>
            <p className="muted-copy">
              You will choose or confirm the final payment mode while placing an order in checkout.
            </p>
          </div>

          <div className="panel">
            <h2>Notifications</h2>
            <div className="admin-list">
              {notifications.length === 0 ? (
                <div className="empty-state">No notifications yet.</div>
              ) : (
                notifications.map((notification) => (
                  <article className="admin-card" key={notification._id}>
                    <div>
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                    </div>
                    {!notification.isRead ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => markNotificationRead(notification._id)}
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="status-badge status-completed">Read</span>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
