import React, { useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/users/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-panel auth-panel-wide">
        <div className="auth-copy">
          <p className="eyebrow">Customer onboarding</p>
          <h1>Create your poultry buyer account and keep delivery details saved.</h1>
          <p>
            This profile powers faster checkout, buy-now requests, repeat purchases, and order
            notifications.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Register</h2>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="form-grid">
            <input className="form-input" name="name" placeholder="Full name" onChange={handleChange} />
            <input className="form-input" name="email" type="email" placeholder="Email address" onChange={handleChange} />
            <input className="form-input" name="phone" placeholder="Phone number" onChange={handleChange} />
            <input className="form-input" name="password" type="password" placeholder="Create password" onChange={handleChange} />
            <input className="form-input form-span" name="address" placeholder="Street address" onChange={handleChange} />
            <input className="form-input" name="city" placeholder="City" onChange={handleChange} />
            <input className="form-input" name="state" placeholder="State" onChange={handleChange} />
            <input className="form-input" name="pincode" placeholder="Pincode" onChange={handleChange} />
          </div>
          <button className="primary-button form-button">Create account</button>
          <p className="form-footer">
            Already registered? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Register;
