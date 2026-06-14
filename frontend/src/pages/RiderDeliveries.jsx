import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { riderAPI } from "../services/api";
import { RiderNavbar } from "../components/RiderNavbar";
import "../style/rider.css";

export function RiderDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const [filter, setFilter] = useState("assigned");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);

      const response = await riderAPI.getDeliveries();

      setDeliveries(response.deliveries || []);
    } catch (error) {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);

      await riderAPI.updateDeliveryStatus(id, status);

      toast.success("Status updated");

      loadDeliveries();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredDeliveries = deliveries.filter((order) => {
    const matchesSearch =
      order._id?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase());

    if (filter === "assigned")
      return (
        (order.status === "pending" ||
          order.status === "assigned") &&
        matchesSearch
      );

    if (filter === "transit")
      return (
        order.status === "processing" &&
        matchesSearch
      );

    if (filter === "delivered")
      return (
        order.status === "delivered" &&
        matchesSearch
      );

    return matchesSearch;
  });

  return (
    <div className="rider-page">
      <RiderNavbar />

      <div className="rider-deliveries-container">

        <div className="rider-page-header">
          <h1>My Deliveries</h1>
          <p>Manage assigned orders and delivery updates</p>
        </div>

        <div className="rider-filter-bar">

          <div className="rider-filters">
       

            <button
              className={filter === "transit" ? "active" : ""}
              onClick={() => setFilter("transit")}
            >
              In Transit
            </button>

            <button
              className={filter === "delivered" ? "active" : ""}
              onClick={() => setFilter("delivered")}
            >
              Delivered
            </button>
          </div>

          <input
            type="text"
            placeholder="Search order/customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="rider-loading">
            Loading deliveries...
          </div>
        ) : (
          <div className="rider-table-wrapper">

            <table className="rider-table">

              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-row">
                      No deliveries found
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((order) => (
                    <tr key={order._id}>

                      <td>
                        #{order._id.slice(-8)}
                      </td>

                      <td>
                        {order.user?.name}
                      </td>

                      <td>
                        {order.deliveryAddress?.address}
                      </td>

                      <td>
                        {order.phone}
                      </td>

                      <td>
                        Rs {order.totalAmount}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${order.status}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>
                        {order.items?.length || 0}
                      </td>

                      <td>

                        {order.status === "pending" && (
                          <button
                            className="pickup-btn"
                            disabled={updating === order._id}
                            onClick={() =>
                              updateStatus(
                                order._id,
                                "processing"
                              )
                            }
                          >
                            Pick Up
                          </button>
                        )}

                        {order.status === "processing" && (
                          <button
                            className="deliver-btn"
                            disabled={updating === order._id}
                            onClick={() =>
                              updateStatus(
                                order._id,
                                "delivered"
                              )
                            }
                          >
                            Delivered
                          </button>
                        )}

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        )}
      </div>
    </div>
  );
}