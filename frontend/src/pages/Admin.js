import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";

const emptyProduct = {
  name: "",
  category: "Fresh Chicken",
  description: "",
  price: "",
  unit: "per kg",
  stock: "",
  image: "",
  badge: "",
  featured: false,
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const loadDashboard = async () => {
    try {
      const [statsRes, ordersRes, productsRes, notificationsRes, usersRes] = await Promise.all([
        axios.get("/admin/stats"),
        axios.get("/orders"),
        axios.get("/products"),
        axios.get("/admin/notifications"),
        axios.get("/users"),
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setNotifications(notificationsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      setStatusMessage("Admin data could not be loaded.");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setStatusMessage("");

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      if (editingId) {
        await axios.put(`/products/${editingId}`, payload);
        setStatusMessage("Product updated successfully.");
      } else {
        await axios.post("/products", payload);
        setStatusMessage("Product added successfully.");
      }

      setFormData(emptyProduct);
      setEditingId(null);
      loadDashboard();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || "Product action failed.");
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      image: product.image,
      badge: product.badge,
      featured: product.featured,
    });
    setActiveTab("products");
  };

  const deleteProduct = async (id) => {
    await axios.delete(`/products/${id}`);
    loadDashboard();
  };

  const updateOrderStatus = async (orderId, status) => {
    await axios.patch(`/orders/${orderId}/status`, { status });
    loadDashboard();
  };

  const markNotificationRead = async (notificationId) => {
    await axios.patch(`/admin/notifications/${notificationId}/read`);
    loadDashboard();
  };

  const pricingHighlights = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const key = product.category || "General";
      const current = categoryMap.get(key) || {
        category: key,
        totalPrice: 0,
        count: 0,
        stock: 0,
      };

      current.totalPrice += product.price || 0;
      current.count += 1;
      current.stock += product.stock || 0;

      categoryMap.set(key, current);
    });

    return Array.from(categoryMap.values()).map((item) => ({
      ...item,
      averagePrice: item.count ? Math.round(item.totalPrice / item.count) : 0,
    }));
  }, [products]);

  const tabs = ["overview", "products", "orders", "customers", "notifications"];

  return (
    <section className="dashboard-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin workspace</p>
          <h1>Marketplace Control Center</h1>
        </div>
        <p>
          Manage rates, products, customer accounts, incoming order requests, and admin
          notifications from one place.
        </p>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`sidebar-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="sidebar-index">0{index + 1}</span>
              <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </aside>

        <div className="admin-content">
          {activeTab === "overview" && stats ? (
            <div className="admin-stack">
              <div className="metric-grid">
                <article className="panel metric-card">
                  <span>Revenue</span>
                  <strong>Rs. {stats.metrics.totalRevenue}</strong>
                </article>
                <article className="panel metric-card">
                  <span>Orders</span>
                  <strong>{stats.metrics.orders}</strong>
                </article>
                <article className="panel metric-card">
                  <span>Customers</span>
                  <strong>{stats.metrics.users}</strong>
                </article>
                <article className="panel metric-card">
                  <span>Unread alerts</span>
                  <strong>{stats.metrics.unreadNotifications}</strong>
                </article>
              </div>

              <div className="dual-grid">
                <div className="panel">
                  <h3>Recent orders</h3>
                  {stats.recentOrders.map((order) => (
                    <div className="list-row" key={order._id}>
                      <span>{order.userId?.name || "Customer"}</span>
                      <strong>Rs. {order.totalPrice}</strong>
                    </div>
                  ))}
                </div>
                <div className="panel">
                  <h3>Low stock products</h3>
                  {stats.lowStockProducts.map((product) => (
                    <div className="list-row" key={product._id}>
                      <span>{product.name}</span>
                      <strong>{product.stock} left</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dual-grid">
                <div className="panel">
                  <h3>Pricing board</h3>
                  <div className="admin-list">
                    {pricingHighlights.map((item) => (
                      <div className="admin-card" key={item.category}>
                        <div className="list-row">
                          <strong>{item.category}</strong>
                          <span>{item.count} items</span>
                        </div>
                        <p>Average rate: Rs. {item.averagePrice}</p>
                        <p>Total stock tracked: {item.stock}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <h3>Customer activity</h3>
                  <div className="admin-list">
                    {users.slice(0, 5).map((user) => (
                      <div className="admin-card" key={user._id}>
                        <div className="list-row">
                          <strong>{user.name}</strong>
                          <span>{user.isAdmin ? "Admin" : "Customer"}</span>
                        </div>
                        <p>{user.email}</p>
                        <p>{user.phone || "Phone not added yet"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "products" ? (
            <div className="admin-stack">
              <form className="panel product-form" onSubmit={submitProduct}>
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Catalog management</p>
                    <h2>{editingId ? "Edit product and change rate" : "Add new product"}</h2>
                  </div>
                  {statusMessage ? <p className="form-info">{statusMessage}</p> : null}
                </div>
                <div className="form-grid">
                  <input className="form-input" name="name" placeholder="Product name" value={formData.name} onChange={handleFormChange} />
                  <input className="form-input" name="category" placeholder="Category" value={formData.category} onChange={handleFormChange} />
                  <input className="form-input" name="price" type="number" placeholder="Price" value={formData.price} onChange={handleFormChange} />
                  <input className="form-input" name="unit" placeholder="Unit" value={formData.unit} onChange={handleFormChange} />
                  <input className="form-input" name="stock" type="number" placeholder="Stock" value={formData.stock} onChange={handleFormChange} />
                  <input className="form-input" name="badge" placeholder="Badge" value={formData.badge} onChange={handleFormChange} />
                  <input className="form-input form-span" name="image" placeholder="Image URL" value={formData.image} onChange={handleFormChange} />
                  <textarea className="form-input form-span" rows="4" name="description" placeholder="Short product description" value={formData.description} onChange={handleFormChange} />
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleFormChange} />
                  Feature this product on the home page
                </label>
                <div className="button-row">
                  <button className="primary-button form-button">
                    {editingId ? "Update product" : "Add product"}
                  </button>
                  {editingId ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData(emptyProduct);
                      }}
                    >
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="panel">
                <h3>Current catalog</h3>
                <div className="admin-list">
                  {products.map((product) => (
                    <div className="admin-card" key={product._id}>
                      <div>
                        <h4>{product.name}</h4>
                        <p>
                          Rs. {product.price} | {product.stock} in stock | {product.category}
                        </p>
                      </div>
                      <div className="button-row">
                        <button type="button" className="secondary-button" onClick={() => editProduct(product)}>
                          Edit
                        </button>
                        <button type="button" className="nav-button" onClick={() => deleteProduct(product._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "orders" ? (
            <div className="panel">
              <h2>Incoming orders</h2>
              <div className="admin-list">
                {orders.map((order) => (
                  <article className="order-card" key={order._id}>
                    <div className="order-card-top">
                      <div>
                        <h3>{order.customer?.name || order.userId?.name}</h3>
                        <p>
                          {order.customer?.phone || order.userId?.phone || "No phone"} | {order.customer?.email || order.userId?.email}
                        </p>
                      </div>
                      <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </div>
                    <p className="muted-copy">
                      {order.deliveryAddress?.address}, {order.deliveryAddress?.city},{" "}
                      {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                    </p>
                    <p className="muted-copy">
                      Payment: {order.paymentMethod} | Payment status: {order.paymentStatus}
                    </p>
                    {order.note ? <p className="muted-copy">Customer note: {order.note}</p> : null}
                    <ul className="feature-list">
                      {order.products.map((product, index) => (
                        <li key={`${order._id}-${index}`}>
                          {product.name} x {product.quantity} = Rs. {product.price * product.quantity}
                        </li>
                      ))}
                    </ul>
                    <div className="button-row">
                      {["confirmed", "packed", "out-for-delivery", "completed"].map((status) => (
                        <button
                          type="button"
                          className="secondary-button"
                          key={status}
                          onClick={() => updateOrderStatus(order._id, status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "customers" ? (
            <div className="panel">
              <h2>Customer panel view</h2>
              <div className="admin-list">
                {users.map((user) => (
                  <article className="admin-card" key={user._id}>
                    <div className="list-row">
                      <div>
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                      </div>
                      <span className={`status-badge ${user.isAdmin ? "status-packed" : "status-completed"}`}>
                        {user.isAdmin ? "Admin" : "Customer"}
                      </span>
                    </div>
                    <p>Phone: {user.phone || "Not provided"}</p>
                    <p>
                      Address:{" "}
                      {user.address
                        ? `${user.address}, ${user.city}, ${user.state} - ${user.pincode}`
                        : "Profile incomplete"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "notifications" ? (
            <div className="panel">
              <h2>Admin notifications</h2>
              <div className="admin-list">
                {notifications.map((notification) => (
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
                        Mark as read
                      </button>
                    ) : (
                      <span className="status-badge status-completed">Read</span>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Admin;
