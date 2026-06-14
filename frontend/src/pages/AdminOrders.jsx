import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminNavbar } from "../components/AdminNavbar";
import "../style/Admin.css";

export function AdminOrders() {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("freshcartUser"));
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("freshcartToken");
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load order history"
      );
    }
  };

  useEffect(() => {
    if (!token) return;

    loadOrders();

    const interval = setInterval(loadOrders, 15000);

    return () => clearInterval(interval);
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "pending";
      case "processing":
        return "processing";
      case "delivered":
        return "delivered";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("freshcartToken");
    localStorage.removeItem("freshcartUser");
    navigate("/login");
  };

  return (
    <div className="dashboard-page dashboard-admin">
      <AdminNavbar />

      <section className="dashboard-panel-orders">
        <h2>Order Records</h2>

        {orders.length === 0 ? (
          <p className="empty-state">No order history yet.</p>
        ) : (
          <div className="orders-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Products Ordered</th>
                  <th>Delivery Address</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Rider</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="order-id">#{order._id?.slice(-8)}</span>
                    </td>
                    <td>
                      <div className="order-customer">{order.user?.name || "Unknown"}</div>
                      <div className="order-customer-email">{order.user?.email || "N/A"}</div>
                    </td>
                    <td>
                      <span className="order-items-count">{order.phone || "N/A"}</span>
                    </td>
                    <td>
                      <div className="order-products-list">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="product-item-row">
                              {item.product?.imageUrl && (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.name}
                                  className="product-item-image"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80";
                                  }}
                                />
                              )}
                              <div className="product-item-info">
                                <strong>{item.name}</strong>
                                <div style={{ fontSize: "0.7rem", color: "#000000" }}>
                                  Qty: {item.quantity} × Rs {item.price}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span style={{ color: "#000000" }}>No items</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.9rem", color: "#000000" }}>
                        <strong>{order.deliveryAddress?.city || "N/A"}</strong>
                        <div style={{ fontSize: "0.8rem", color: "#000000", marginTop: "2px" }}>
                          {order.deliveryAddress?.address || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="order-amount">Rs {order.totalAmount?.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`order-status status-${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="order-rider">
                        {order.assignedRider ? (
                          <div>
                            <div className="rider-assigned">✓ {order.assignedRider?.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "#000000" }}>
                              {order.assignedRider?.city}
                            </div>
                          </div>
                        ) : (
                          <div className="rider-not-assigned">⚠ Not assigned</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}