import { Link, useNavigate } from "react-router-dom";
import "../style/riderNavbar.css";

export function RiderNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("freshcartToken");
    localStorage.removeItem("freshcartUser");
    navigate("/login");
  };

  return (
    <nav className="rider-topbar">

      <div className="rider-brand">
        FreshCart🥕
      </div>

      <div className="rider-right">

        <div className="rider-links">

          <Link to="/dashboard/rider">
            Home
          </Link>

          <Link to="/deliveries">
            My Deliveries
          </Link>

          <Link to="/rider-map">
            Live Map
          </Link>

          <Link to="/rider-earnings">
            Earnings
          </Link>

        
          <Link to="/rider-profile">
            Profile
          </Link>

          <Link to="/rider-support">
            Support
          </Link>

        </div>

        <button
          className="rider-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}