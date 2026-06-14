import { Navigate, useLocation } from "react-router-dom";

function getAuthState() {
  const token = localStorage.getItem("freshcartToken");
  const rawUser = localStorage.getItem("freshcartUser");

  if (!token || !rawUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser),
    };
  } catch {
    return { token: null, user: null };
  }
}

export function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { token, user } = getAuthState();

  // ❌ not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ❌ role mismatch → SEND TO LOGIN (NOT DASHBOARD)
  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" replace />;
  }

  return children;
}