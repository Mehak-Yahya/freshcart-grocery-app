import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { riderAPI } from "../services/api.js";
import { RiderNavbar } from "../components/RiderNavbar";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../style/rider.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* FIX: Proper Leaflet icon setup */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export function RiderMap() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    initializeMap();
    loadDeliveries();

    /* Live rider location */
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          riderAPI.updateLocation(latitude, longitude).catch(() => {});

          if (mapInstance.current) {
            mapInstance.current.setView([latitude, longitude], 13);
          }
        },
        () => {
          toast.warning("Enable location services for live tracking");
        }
      );
    }

    return () => {
      markersRef.current.forEach((m) => {
        if (mapInstance.current && m) {
          mapInstance.current.removeLayer(m);
        }
      });
    };
  }, []);

  const initializeMap = () => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        [24.8607, 67.0011],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance.current);

      setMapReady(true);
    }
  };

  const loadDeliveries = async () => {
    try {
      setLoading(true);

      const res = await riderAPI.getDeliveries();

      const active =
        res.deliveries?.filter(
          (d) => d.status === "processing" || d.status === "assigned"
        ) || [];

      setDeliveries(active);

      /* Update markers */
      if (mapInstance.current) {
        markersRef.current.forEach((m) =>
          mapInstance.current.removeLayer(m)
        );
        markersRef.current = [];

        active.forEach((d) => {
          // NOTE: replace with real backend lat/lng
          const lat = 24.8607 + Math.random() * 0.05;
          const lng = 67.0011 + Math.random() * 0.05;

          const marker = L.marker([lat, lng])
            .addTo(mapInstance.current)
            .bindPopup(
              `<b>${d.user?.name || "Customer"}</b><br>${
                d.user?.address || ""
              }`
            );

          markersRef.current.push(marker);
        });
      }
    } catch {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const navigateToCustomer = (delivery) => {
    if (!delivery?.user?.address) {
      toast.error("No address found");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      delivery.user.address
    )}`;

    window.open(url, "_blank");
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      assigned: "#3b82f6",
      processing: "#8b5cf6",
      delivered: "#22c55e",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <div className="dashboard-page dashboard-rider">
      <RiderNavbar />

      {/* HEADER */}
      <header className="rider-header">
        <div>
\          <h1>Rider Map</h1>
          <p>Track deliveries and navigate to customers</p>
        </div>
      </header>

      {/* MAP + LIST */}
      <div className="map-container">
        {/* MAP */}
        <div
          ref={mapRef}
          style={{ height: "400px", width: "100%", borderRadius: "12px" }}
        />

        {!mapReady && <p>Loading map...</p>}

        {/* DELIVERY LIST */}
        <section className="rider-panel">
          <h2>Active Deliveries ({deliveries.length})</h2>

          {loading ? (
            <p>Loading...</p>
          ) : deliveries.length === 0 ? (
            <p>No active deliveries</p>
          ) : (
            deliveries.map((d) => (
              <div
                key={d._id}
                onClick={() => setSelectedDelivery(d)}
                style={{
                  padding: "12px",
                  margin: "10px 0",
                  borderRadius: "10px",
                  background:
                    selectedDelivery?._id === d._id
                      ? "#e0e7ff"
                      : "#fff",
                  cursor: "pointer",
                }}
              >
                <strong>{d.user?.name}</strong>
                <p>{d.user?.address}</p>

                <span
                  style={{
                    color: "#fff",
                    background: getStatusColor(d.status),
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                  }}
                >
                  {d.status}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToCustomer(d);
                  }}
                  style={{
                    marginTop: "8px",
                    padding: "6px 10px",
                    border: "none",
                    background: "#4f46e5",
                    color: "#fff",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Navigate
                </button>
              </div>
            ))
          )}
        </section>

        {/* DETAILS */}
        {selectedDelivery && (
          <section className="rider-panel">
            <h2>Delivery Details</h2>

            <p>
              <b>Customer:</b> {selectedDelivery.user?.name}
            </p>
            <p>
              <b>Phone:</b> {selectedDelivery.user?.phone}
            </p>
            <p>
              <b>Address:</b> {selectedDelivery.user?.address}
            </p>

            <button
              onClick={() => navigateToCustomer(selectedDelivery)}
              style={{
                marginTop: "10px",
                padding: "10px 14px",
                background: "#10b981",
                border: "none",
                color: "#fff",
                borderRadius: "8px",
              }}
            >
              Start Navigation
            </button>
          </section>
        )}
      </div>
    </div>
  );
}