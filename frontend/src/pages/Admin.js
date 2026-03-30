import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Admin = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      alert("Access denied");
      return;
    }

    axios.get("/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {orders.map(order => (
        <div key={order._id} style={{ border: "1px solid gray", padding: 10, marginBottom: 10 }}>
          <p><b>User ID:</b> {order.userId}</p>
          <p><b>Total:</b> ₹{order.totalPrice}</p>
          <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>

          <ul>
            {order.products.map((p, i) => (
              <li key={i}>{p.name} × {p.quantity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Admin;
