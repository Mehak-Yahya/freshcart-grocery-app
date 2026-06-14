import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import "../style/customerNavbar.css";

export default function CustomerNav() {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  const user = JSON.parse(
    localStorage.getItem("freshcartUser") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("freshcartToken");
    localStorage.removeItem("freshcartUser");
    navigate("/login");
  };

  return (
    <header className="cust-navbar">
      <div className="cust-navbar-brand">
        FreshCart🥕
      </div>

      <div className="cust-navbar-right">
        <nav className="cust-navbar-links">
          <Link to="/dashboard/customer">Home</Link>

          <Link to="/cart">
            Cart ({getTotalItems()})
          </Link>

          {/* MY ORDERS LINK ADDED HERE */}
          <Link to="/orders">
            My Orders
          </Link>
           <Link to="/customer-profile">
  Profile
</Link>
        </nav>

        <button
          className="cust-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}