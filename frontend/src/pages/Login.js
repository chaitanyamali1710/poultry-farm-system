import React, { useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("isAdmin", String(res.data.isAdmin));
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(res.data.isAdmin ? "/admin" : "/profile");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to manage orders, checkout faster, and track every purchase.</h1>
          <p>
            Admins can update live pricing and monitor orders. Customers can shop, pay by preferred
            method, and edit their profile.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error ? <p className="form-error">{error}</p> : null}
          <input
            className="form-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary-button form-button">Login</button>
          <p className="form-footer">
            New here? <Link to="/register">Create your account</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
