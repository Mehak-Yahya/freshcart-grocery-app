import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { riderAPI } from "../services/api.js";
import { RiderNavbar } from "../components/RiderNavbar";
import "../style/rider.css";

export function RiderDashboard() {
  const user = JSON.parse(localStorage.getItem("freshcartUser") || "null");

  const [deliveries, setDeliveries] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ availability toggle state
  const [isAvailable, setIsAvailable] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadAvailability();

    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ---------------- DASHBOARD DATA ----------------
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [deliveriesRes, earningsRes] = await Promise.all([
        riderAPI.getDeliveries(),
        riderAPI.getEarnings().catch(() => ({ earnings: null })),
      ]);

      setDeliveries(deliveriesRes.deliveries || []);

      if (earningsRes.earnings) {
        setEarnings(earningsRes.earnings);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AVAILABILITY ----------------
  const loadAvailability = async () => {
    try {
      const response = await riderAPI.getProfile();
      const rider = response?.rider || response?.data?.rider;

      setIsAvailable(!!rider?.isAvailable);
    } catch (err) {
      toast.error("Failed to load status");
    }
  };

  const handleToggle = async () => {
    try {
      setToggling(true);

      const newStatus = !isAvailable;

      await riderAPI.toggleAvailability(newStatus);

      setIsAvailable(newStatus);

      toast.success(newStatus ? "Online 🟢" : "Offline 🔴");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  // ---------------- STATS ----------------
  const assignedOrders = deliveries.length;

  const pendingPickup = deliveries.filter((d) => d.status === "pending").length;

  const inTransit = deliveries.filter((d) => d.status === "processing").length;

  const deliveredToday = deliveries.filter((d) => {
    if (d.status !== "delivered") return false;

    const today = new Date().toDateString();
    const deliveryDate = new Date(d.updatedAt || d.createdAt).toDateString();

    return today === deliveryDate;
  }).length;

  const recentOrders = deliveries
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="dashboard-page dashboard-rider">
      <RiderNavbar />

      {/* HEADER + TOGGLE */}
      <header className="rider-header">
        <div>

          <h1>Welcome {user?.name || "Rider"}</h1>

          <p>Manage assigned deliveries and update delivery statuses.</p>
        </div>

        {/* SMALL INLINE TOGGLE */}
        <div className="mini-toggle">
          <span className={`dot ${isAvailable ? "online" : "offline"}`} />

          <button
            onClick={handleToggle}
            disabled={toggling}
            className="mini-toggle-btn"
          >
            {toggling ? "..." : isAvailable ? "Online" : "Offline"}
          </button>
        </div>
      </header>

      {/* LOADING */}
      {loading ? (
        <div className="rider-panel">
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* STATS */}
          <section className="rider-stats">
            <article className="rider-stat-card">
              <span>Assigned Orders</span>
              <strong>{assignedOrders}</strong>
            </article>

            <article className="rider-stat-card">
              <span>Pending Pickup</span>
              <strong>{pendingPickup}</strong>
            </article>

            <article className="rider-stat-card">
              <span>In Transit</span>
              <strong>{inTransit}</strong>
            </article>

            <article className="rider-stat-card">
              <span>Delivered Today</span>
              <strong>{deliveredToday}</strong>
            </article>

            {earnings && (
              <article
                className="rider-stat-card"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))",
                }}
              >
                <span>💰 Today's Earnings</span>
                <strong style={{ color: "#884e69;", fontSize: "2rem" }}>
                  Rs {earnings.today?.toFixed(2) || "0.00"}
                </strong>
                <small style={{ color: "#884e69;", marginTop: "5px" }}>
                  {earnings.todayBreakdown?.bonus > 0
                    ? `+Rs ${earnings.todayBreakdown.bonus.toFixed(2)} bonus! 🎉`
                    : "Complete 5+ deliveries for bonus"}
                </small>
              </article>
            )}
          </section>
        </>
      )}
    </div>
  );
}