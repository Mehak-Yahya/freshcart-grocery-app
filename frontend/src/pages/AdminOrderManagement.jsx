import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminAPI, riderAPI } from "../services/api.js";
import { AdminNavbar } from "../components/AdminNavbar";
import "../style/Admin.css";

const fallbackImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

export function AdminOrderManagement() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("freshcartUser") || "null");
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard/admin");
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [ordersData, ridersData] = await Promise.all([
        adminAPI.getOrders(),
        adminAPI.getRiders(),
      ]);

      setOrders(ordersData.orders || []);
      setRiders(ridersData.riders || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrder = async (orderId, riderId) => {
    if (!riderId) {
      toast.error("Please select a rider");
      return;
    }

    try {
      setAssigningOrder(orderId);
      await adminAPI.assignOrderToRider(orderId, riderId);

      toast.success("Order assigned to rider successfully!");
      setSelectedOrder(null);
      setSelectedRider(null);
      loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to assign order"
      );
    } finally {
      setAssigningOrder(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("freshcartToken");
    localStorage.removeItem("freshcartUser");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#c27400";
      case "processing":
        return "#064477";
      case "delivered":
        return "#000000";
      case "cancelled":
        return "#e61f11";
      default:
        return "#0a0a0a";
    }
  };

  return (
    <div className="dashboard-page dashboard-admin">
      <AdminNavbar />

      <section className="dashboard-panel-management">
        <div className="order-management-grid">
          {/* Orders List */}
          <div>
            <h2>All Orders</h2>
            {loading ? (
              <p style={{ textAlign: "center", padding: "20px", color: "#9ca3af" }}>
                Loading orders...
              </p>
            ) : orders.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af" }}>
                No orders found
              </p>
            ) : (
              <div className="orders-list-container">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`order-card ${selectedOrder?._id === order._id ? "selected" : ""}`}
                  >
                    <div className="order-card-header">
                      <h4 className="order-card-title">
                        Order #{order._id?.slice(-8)}
                      </h4>
                      <span className={`order-card-badge status-${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="order-card-meta">
                      {order.user?.name || "Customer"} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    <div className="order-card-body">
                      <div className="order-card-info">
                        <p><strong style={{color: '#111827'}}>Rs {order.totalAmount?.toFixed(2)}</strong></p>
                        <p>{order.items?.length || 0} items</p>
                 <div className="order-card-images">
  {order.items && order.items.slice(0, 4).map((item, idx) => (
    <div key={idx} className="order-product-mini">

      <img
        src={item.product?.imageUrl || fallbackImage}
        alt={item.product?.name}
        className="order-product-thumb"
        onError={(e) => { e.target.src = fallbackImage; }}
      />

      <span className="order-product-name">
        {item.product?.name}
      </span>

      {item.quantity > 1 && (
        <span className="order-product-qty">×{item.quantity}</span>
      )}

    </div>
  ))}

                          {order.items && order.items.length > 4 && (
                            <div style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "4px",
                              border: "1px solid #e5e7eb",
                              background: "#f3f4f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              color: "#000000",
                            }}>
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="order-card-location">
                        <p><strong>📍 {order.deliveryAddress?.city}</strong></p>
                        {order.assignedRider ? (
                          <div className="order-card-rider" style={{ color: "#059669" }}>
                            ✓ {riders.find(r => r._id === order.assignedRider)?.name || "Assigned"}
                          </div>
                        ) : (
                          <div className="order-card-rider" style={{ color: "#dc2626" }}>
                            ⚠ Unassigned
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Panel */}
          <div>
            <h2>Assign Rider</h2>
            {selectedOrder ? (
              <div className="assignment-panel">
                {/* Order Details */}
                <div className="assignment-section">
                  <div className="assignment-section-title">Order Details</div>
                  <div className="order-details-box">
                    <p><strong>Order ID:</strong><span>#{selectedOrder._id?.slice(-8)}</span></p>
                    <p><strong>Customer:</strong><span>{selectedOrder.user?.name}</span></p>
                    <p><strong>Phone:</strong><span>{selectedOrder.phone}</span></p>
                    <p><strong>Amount:</strong><span>Rs {selectedOrder.totalAmount?.toFixed(2)}</span></p>
                    <p><strong>Delivery:</strong><span>{selectedOrder.deliveryAddress?.city}</span></p>
                    <p><strong>Status:</strong><span style={{textTransform: 'capitalize'}}>{selectedOrder.status}</span></p>
                  </div>
                </div>

                {/* Assigned Rider */}
                {selectedOrder.assignedRider && (
                  <div className="assignment-section">
                    <div className="assignment-section-title">🚴 Current Rider</div>
                    <div className="rider-assigned-box">
                      {riders.find(r => r._id === selectedOrder.assignedRider) ? (
                        <>
                          <p><strong>{riders.find(r => r._id === selectedOrder.assignedRider)?.name}</strong></p>
                          <p>📞 {riders.find(r => r._id === selectedOrder.assignedRider)?.phone}</p>
                          <p>📍 {riders.find(r => r._id === selectedOrder.assignedRider)?.city}</p>
                        </>
                      ) : (
                        <p>Rider information not found</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Products */}
                <div className="assignment-section">
                  <div className="assignment-section-title">📦 Products</div>
                  <div className="products-list-compact">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="product-list-item">
                          <img
                            src={item.product?.imageUrl || fallbackImage}
                            alt={item.name}
                            className="product-list-thumb"
                            onError={(e) => { e.target.src = fallbackImage; }}
                          />
                          <div className="product-list-info">
                            <p className="product-list-name">{item.name}</p>
                            <p className="product-list-details">×{item.quantity} • Rs {item.price}</p>
                          </div>
                          <div className="product-list-price">Rs {(item.price * item.quantity).toFixed(0)}</div>
                        </div>
                      ))
                    ) : (
                      <p style={{ padding: "10px", color: "#9ca3af", fontSize: "0.8rem" }}>
                        No items in order
                      </p>
                    )}
                  </div>
                </div>

                {/* Select Rider */}
                <div className="assignment-section">
                  <div className="assignment-section-title">Select Rider</div>
                  <select
                    value={selectedRider || ""}
                    onChange={(e) => setSelectedRider(e.target.value)}
                    className="rider-select"
                  >
                    <option value="">Choose a rider...</option>
                    {riders.map((rider) => (
                      <option key={rider._id} value={rider._id}>
                        {rider.name} • {rider.city || "No city"} • {rider.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <button
                  onClick={() => {
                    if (riders.length === 0) {
                      toast.error("No riders available");
                      return;
                    }

                    const deliveryCity = selectedOrder.deliveryAddress?.city?.toLowerCase();
                    let bestRider = riders[0];

                    const sameCity = riders.filter(r => 
                      r.city?.toLowerCase() === deliveryCity
                    );
                    if (sameCity.length > 0) {
                      bestRider = sameCity[Math.floor(Math.random() * sameCity.length)];
                    } else {
                      bestRider = riders[Math.floor(Math.random() * riders.length)];
                    }

                    setSelectedRider(bestRider._id);
                    toast.info(`✓ Auto-assigned to ${bestRider.name}`);
                  }}
                  className="btn-auto-assign"
                >
                  🤖 Auto-Assign
                </button>

                <button
                  onClick={() =>
                    handleAssignOrder(selectedOrder._id, selectedRider)
                  }
                  disabled={!selectedRider || assigningOrder === selectedOrder._id}
                  className="btn-assign"
                >
                  {assigningOrder === selectedOrder._id
                    ? "Assigning..."
                    : "✓ Assign Rider"}
                </button>

                {selectedOrder.assignedRider && (
                  <div className="alert-assigned">
                    ✓ Already assigned to a rider
                  </div>
                )}
              </div>
            ) : (
              <div className="assignment-panel-empty">
                <p>Select an order to assign a rider</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
