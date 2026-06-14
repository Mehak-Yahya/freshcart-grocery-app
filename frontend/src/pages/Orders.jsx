import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { orderAPI } from "../services/api.js";
import CustomerNav from "../components/customernav";
import "../style/customer.css";

export function Orders() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("freshcartUser") || "null");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await orderAPI.getAll();
        setOrders(data.orders || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="customer-orders-page">
      <CustomerNav />

      <header className="customer-orders-header">
        <div>
          <h1>Order History</h1>
          <p>View and track all your orders.</p>
        </div>
      </header>

      <section className="customer-orders-panel">
        {loading ? (
          <p className="orders-loading">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p>You haven't placed any orders yet</p>

            <Link to="/dashboard/customer" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order._id}>
                
                {/* HEADER */}
                <div className="order-top">
                  <div>
                    <h3>Order #{order._id?.slice(-8) || "N/A"}</h3>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className={`order-status ${order.status}`}>
                    {order.status}
                  </span>
                </div>

                {/* ITEMS */}
                <div className="order-items">
                  {order.items?.map((item, idx) => (
                    <div className="order-item" key={idx}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>Rs {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="order-bottom">
                  <div className="order-address">
                    <p>{order.deliveryAddress?.city || "N/A"}</p>
                    <span>{order.deliveryAddress?.address || "N/A"}</span>
                  </div>

                  <div className="order-total">
                    <strong>Rs {order.totalAmount?.toFixed(2)}</strong>
                    <span>{order.paymentMethod || "COD"}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}