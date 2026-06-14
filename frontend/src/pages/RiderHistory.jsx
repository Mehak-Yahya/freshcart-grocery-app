import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { riderAPI } from "../services/api.js";
import { RiderNavbar } from "../components/RiderNavbar";
import "../style/rider.css";

export function RiderHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (
    filterStatus = "all",
    start = "",
    end = ""
  ) => {
    try {
      setLoading(true);
      const status = filterStatus === "all" ? null : filterStatus;
      const response = await riderAPI.getHistory(start, end, status);
      setHistory(response.history || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load delivery history"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    loadHistory(newFilter, startDate, endDate);
  };

  const handleDateFilter = () => {
    loadHistory(filter, startDate, endDate);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "#FFA500",
      processing: "#3498DB",
      delivered: "#27AE60",
      cancelled: "#E74C3C",
    };

    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: statusColors[status] || "#95A5A6",
        }}
      >
        {status?.charAt(0).toUpperCase() +
          status?.slice(1)}
      </span>
    );
  };

  return (
    <div className="dashboard-page dashboard-rider">
      <RiderNavbar />

      <header className="rider-header">
        <div>
          <h1>My Deliveries</h1>
          <p>Track all your completed and past deliveries</p>
        </div>
      </header>

      <section className="rider-panel">
        <h2>Filters</h2>
        <div className="history-filters">
          <div className="filter-group">
            <label>Status</label>
            <div className="filter-buttons">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => handleFilterChange("all")}
              >
                All
              </button>
              <button
                className={filter === "delivered" ? "active" : ""}
                onClick={() =>
                  handleFilterChange("delivered")
                }
              >
                Delivered
              </button>
              <button
                className={filter === "processing" ? "active" : ""}
                onClick={() =>
                  handleFilterChange("processing")
                }
              >
                Processing
              </button>
              <button
                className={filter === "cancelled" ? "active" : ""}
                onClick={() =>
                  handleFilterChange("cancelled")
                }
              >
                Cancelled
              </button>
            </div>
          </div>

          <div className="filter-group date-filters">
            <label>Date Range</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            <button
              onClick={handleDateFilter}
              className="btn-filter"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rider-panel">
          <p>Loading delivery history...</p>
        </div>
      ) : history.length > 0 ? (
        <section className="rider-panel">
          <h2>Delivery History ({history.length})</h2>
          <div className="history-list">
            {history.map((order) => (
              <div
                key={order._id}
                className="history-item"
              >
                <div className="history-header">
                  <div className="order-id">
                    <strong>Order #{order._id}</strong>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="order-date">
                    {new Date(
                      order.updatedAt
                    ).toLocaleDateString()}{" "}
                    {new Date(
                      order.updatedAt
                    ).toLocaleTimeString()}
                  </div>
                </div>

                <div className="history-details">
                  <div className="detail-item">
                    <span>Customer</span>
                    <strong>{order.user?.name}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Phone</span>
                    <strong>{order.user?.phone}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Address</span>
                    <strong>{order.user?.address}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Total Price</span>
                    <strong>Rs {order.totalPrice}</strong>
                  </div>
                </div>

                <div className="history-items">
                  <strong>Items:</strong>
                  <ul>
                    {order.items?.map((item) => (
                      <li key={item._id}>
                        {item.product?.name} x{item.quantity}
                        - Rs {item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="rider-panel">
          <p>No deliveries found</p>
        </div>
      )}
    </div>
  );
}
