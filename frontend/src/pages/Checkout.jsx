import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext.jsx";
import { orderAPI } from "../services/api.js";
import CustomerNav from "../components/customernav";
import "../style/customer.css";

export function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const user = JSON.parse(localStorage.getItem("freshcartUser") || "null");

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    paymentMethod: "cod",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!formData.address || !formData.city || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: cart.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.cartQuantity,
        })),
        totalAmount: getTotalPrice() + 200,
        deliveryAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
      };

      await orderAPI.create(orderData);

      toast.success("Order placed successfully!");
      clearCart();

      setFormData({
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        paymentMethod: "cod",
      });

      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          Your cart is empty. Please add items before checking out.
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <CustomerNav />

      {/* HEADER */}
      <header className="checkout-header">
        <h1>Order Checkout</h1>
        <p>Review your order details and complete payment.</p>
      </header>

      {/* MAIN GRID */}
      <div className="checkout-container">

        {/* LEFT: ORDER SUMMARY */}
        <section className="checkout-panel">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div className="order-item" key={item._id}>
              <div>
                <p>{item.name}</p>
                <small>
                  {item.cartQuantity} × Rs {item.price}
                </small>
              </div>
              <span>Rs {item.price * item.cartQuantity}</span>
            </div>
          ))}

          <div className="summary-box">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rs {getTotalPrice().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery:</span>
              <span>Rs 50.00</span>
            </div>

            <div className="summary-total">
              <span>Total:</span>
              <span>Rs {(getTotalPrice() + 50).toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* RIGHT: FORM */}
        <section className="checkout-panel">
          <h2>Delivery & Payment Details</h2>

          <form onSubmit={handleSubmitOrder}>

            {/* NAME */}
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={user?.name || ""} disabled />
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user?.email || ""} disabled />
            </div>

            {/* PHONE */}
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="03001234567"
                required
              />
            </div>

            {/* ADDRESS */}
            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter your street address"
                required
              />
            </div>

            {/* CITY + POSTAL */}
            <div className="form-row">

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Karachi"
                  required
                />
              </div>

              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="75500"
                />
              </div>

            </div>

            {/* PAYMENT */}
            <div className="form-group">
              <label>Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="cod">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="checkout-btn"
              disabled={loading}
            >
              {loading ? "Processing Order..." : "Place Order"}
            </button>

          </form>
        </section>

      </div>
    </div>
  );
}