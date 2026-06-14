import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import bgVideo from "../assets/137247-766338227.mp4";
import "../style/auth.css";

export function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    city: "",
  });

  const [errors, setErrors] = useState({});

  const namePattern = /^[A-Za-z][A-Za-z\s]{2,29}$/;

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required";
    } else if (!namePattern.test(formData.name.trim())) {
      nextErrors.name = "Use a real name with at least 3 letters";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (!passwordPattern.test(formData.password)) {
      nextErrors.password =
        "Password must be 8+ chars with upper, lower, number and symbol";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      toast.success("Registered successfully");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="auth-page">

      {/* VIDEO BACKGROUND */}
      <div className="auth-right">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="auth-video-right"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
      </div>

      {/* CENTERED CARD */}
      <div className="auth-container">

        <div className="auth-card ">

          {/* LEFT PANEL */}
          <div className="welcome-panel left">
            <h2>Welcome!</h2>

            <p>
              Already have an account?
            </p>

            <Link to="/login" className="welcome-btn">
              Login
            </Link>
          </div>

          {/* RIGHT PANEL */}
          <div className="signup-panel ">

            <div className="auth-badge">
              FreshCart 🥕
            </div>

            <h1>Sign Up</h1>

            <p className="auth-subtitle">
              Create your account and start shopping.
            </p>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />

              {errors.name && (
                <small className="field-error">
                  {errors.name}
                </small>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />

              {errors.email && (
                <small className="field-error">
                  {errors.email}
                </small>
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              {errors.password && (
                <small className="field-error">
                  {errors.password}
                </small>
              )}

              <div className="role-options">

                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === "customer"}
                    onChange={handleChange}
                  />
                  <span>Customer</span>
                </label>

                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="rider"
                    checked={formData.role === "rider"}
                    onChange={handleChange}
                  />
                  <span>Rider</span>
                </label>

              </div>

              {formData.role === "rider" && (
                <>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </>
              )}

              <button type="submit">
                Sign Up
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}