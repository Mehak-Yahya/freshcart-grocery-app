import { Navigate, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { Register } from "./pages/Register.jsx";
import { Login } from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import { CustomerDashboard } from "./pages/CustomerDashboard.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { AdminProducts } from "./pages/AdminProducts.jsx";
import { AdminOrders } from "./pages/AdminOrders.jsx";
import { AdminOrderManagement } from "./pages/AdminOrderManagement.jsx";
import { CustomerProfile } from "./pages/CustomerProfile.jsx";
import { RiderDashboard } from "./pages/RiderDashboard.jsx";
import { RiderDeliveries } from "./pages/RiderDeliveries.jsx";
import { RiderMap } from "./pages/RiderMap.jsx";
import { RiderEarnings } from "./pages/RiderEarnings.jsx";
import { RiderProfile } from "./pages/RiderProfile.jsx";
import { RiderSupport } from "./pages/RiderSupport.jsx";

import { Products } from "./pages/Products.jsx";
import { Cart } from "./pages/Cart.jsx";
import { Checkout } from "./pages/Checkout.jsx";
import { Orders } from "./pages/Orders.jsx";

import { AddProduct } from "./pages/AddProduct.jsx";

import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { CartProvider } from "./context/CartContext.jsx";

import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <CartProvider>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
        {/* ================= CUSTOMER ROUTES ================= */}
        <Route
          path="/dashboard/customer"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={["customer", "admin"]}>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
  path="/customer-profile"
  element={
    <ProtectedRoute allowedRoles={["customer"]}>
      <CustomerProfile />
    </ProtectedRoute>
  }
/>

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/products/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/order-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrderManagement />
            </ProtectedRoute>
          }
        />

        {/* ================= RIDER ROUTES ================= */}
        <Route
          path="/dashboard/rider"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deliveries"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderDeliveries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider-map"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider-earnings"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderEarnings />
            </ProtectedRoute>
          }
        />

      

       

        <Route
          path="/rider-profile"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider-support"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderSupport />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK (IMPORTANT) ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </CartProvider>
  );
}

export default App;