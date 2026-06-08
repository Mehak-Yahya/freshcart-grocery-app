import { Link, useNavigate } from "react-router-dom";
import "../style/AdminNavbar.css";

export function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("freshcartToken");
    localStorage.removeItem("freshcartUser");
    navigate("/login");
  };

  return (
    <nav className="admin-topbar">

      <div className="admin-brand">
        FreshCart🥕
      </div>

      <div className="admin-right">

        <div className="admin-links">
          <Link to="/dashboard/admin">
            Dashboard
          </Link>

          <Link to="/dashboard/admin/products/new">
            Add Product
          </Link>

          <Link to="/dashboard/admin/products">
            Products
          </Link>

          <Link to="/dashboard/admin/orders">
            Orders
          </Link>

          <Link to="/dashboard/admin/order-management">
            Assign Rider
          </Link>
        </div>

        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}