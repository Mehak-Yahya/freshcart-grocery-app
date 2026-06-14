import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { riderAPI } from "../services/api.js";
import { RiderNavbar } from "../components/RiderNavbar";
import "../style/rider.css";

export function RiderEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadEarnings();

    const interval = setInterval(() => {
      if (autoRefresh) loadEarnings();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const response = await riderAPI.getEarnings();
      setEarnings(response.earnings);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  const black = { color: "#000" };

  return (
    <div className="dashboard-page dashboard-rider">
      <RiderNavbar />

      {/* HEADER */}
      <header className="rider-header">
        <div>
         <h1 style={{ color: "white" }}>Your Earnings</h1>
          <p style={{ color: "white" }}>
            Real delivery earnings based on completed orders
          </p>
        </div>
      </header>

      {/* TOP BAR */}
      <section className="rider-panel" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h3 style={black}>Live Earnings Dashboard</h3>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={{ cursor: "pointer", fontWeight: 600, ...black }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ marginRight: "6px" }}
              />
              Auto refresh
            </label>

            <button
              onClick={loadEarnings}
              disabled={loading}
              style={{
                padding: "8px 14px",
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Updating..." : "Refresh"}
            </button>
          </div>
        </div>

        <p style={black}>
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </section>

      {/* LOADING */}
      {loading && !earnings ? (
        <div className="rider-panel">
          <p style={black}>Loading earnings...</p>
        </div>
      ) : earnings ? (
        <>
          {/* STATS */}
          <section className="rider-stats">
            {[
              ["Today", earnings.today],
              ["Week", earnings.week],
              ["Month", earnings.month],
              ["Total", earnings.total],
            ].map(([label, value], i) => (
              <article key={i} className="rider-stat-card earnings-card">
                <span style={black}>{label}</span>
                <strong style={{ color: "#000", fontSize: "20px" }}>
                  Rs {value?.toFixed(2) || "0.00"}
                </strong>
              </article>
            ))}
          </section>

          {/* BREAKDOWN */}
          {earnings.todayBreakdown && (
            <section className="rider-panel">
              <h2 style={black}>Today's Breakdown</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "10px" }}>
                  <p style={black}>Base Earnings</p>
                  <h3 style={black}>
                    Rs {earnings.todayBreakdown.baseEarnings?.toFixed(2)}
                  </h3>
                </div>

                <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "10px" }}>
                  <p style={black}>Bonus</p>
                  <h3 style={black}>
                    Rs {earnings.todayBreakdown.bonus?.toFixed(2)}
                  </h3>
                  <small style={black}>
                    {earnings.todayBreakdown.reason}
                  </small>
                </div>
              </div>
            </section>
          )}

          

          {/* INFO */}
          <section className="rider-panel">
            <h2 style={black}>How Earnings Work</h2>

            <div
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "10px",
              }}
            >
              <p style={black}>✔ Base delivery pay per order (fixed)</p>
              <p style={black}>✔ Extra bonus for high-value orders</p>
              <p style={black}>✔ Daily incentive for 5+ deliveries</p>
            </div>
          </section>
        </>
      ) : (
        <div className="rider-panel">
          <p style={black}>No earnings data available</p>
        </div>
      )}
    </div>
  );
}