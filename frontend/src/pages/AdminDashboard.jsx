import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminNavbar } from "../components/AdminNavbar";
import "../style/Admin.css";

export function AdminDashboard() {
  const token = localStorage.getItem("freshcartToken");

  const [view, setView] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    inventoryCount: 0,
    pendingOrders: 0,
    orderCount: 0,
  });

  // ================= LOAD STATS =================
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats(response.data.stats || {});
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load stats");
      }
    };

    loadStats();
  }, [token]);

  // ================= LOAD USERS =================
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (view === "users") loadUsers();
  }, [view]);

  // ================= FILTER USERS =================
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === "all" ? true : u.role === roleFilter;

    return matchSearch && matchRole;
  });

  // ================= PAGINATION =================
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;

  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const changePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="dashboard-page dashboard-admin">
      <AdminNavbar />

      <div className="dashboard-container">

        {/* ================= DASHBOARD VIEW ================= */}
        {view === "dashboard" && (
          <>
            <section className="dashboard-header">
              <h1>Welcome Admin</h1>
              <p>
                Manage users, orders, products, inventory, and platform operations.
              </p>
            </section>

            <section className="dashboard-grid">

              <article
                className="dashboard-card users-card clickable"
                onClick={() => {
                  setView("users");
                  setCurrentPage(1);
                }}
              >
                <h3>Total Users</h3>
                <h2>{stats.userCount}</h2>
              </article>

              <article className="dashboard-card orders-card">
                <h3>Pending Orders</h3>
                <h2>{stats.pendingOrders}</h2>
              </article>

              <article className="dashboard-card inventory-card">
                <h3>Inventory Units</h3>
                <h2>{stats.inventoryCount}</h2>
              </article>

              <article className="dashboard-card products-card">
                <h3>Total Products</h3>
                <h2>{stats.productCount}</h2>
              </article>

            </section>
          </>
        )}

        {/* ================= USERS VIEW ================= */}
        {view === "users" && (
          <section className="dashboard-panel-full">

            <div className="panel-header">
              <h2>All Users</h2>

              <button
                className="back-btn"
                onClick={() => setView("dashboard")}
              >
                ← Back
              </button>
            </div>

            {/* SEARCH + FILTER */}
            <div className="user-controls">

              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="user-search"
              />

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="user-filter"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="rider">Rider</option>
              </select>

            </div>

            {/* TABLE */}
            {loadingUsers ? (
              <p className="loading-text">Loading users...</p>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentUsers.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role ${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.phone || "-"}</td>
                        <td>{u.city || "-"}</td>
                        <td>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION */}
            {filteredUsers.length > usersPerPage && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => changePage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}

          </section>
        )}

      </div>
    </div>
  );
}