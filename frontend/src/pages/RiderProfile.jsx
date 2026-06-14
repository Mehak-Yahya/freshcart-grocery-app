import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { riderAPI } from "../services/api.js";
import { RiderNavbar } from "../components/RiderNavbar";
import "../style/rider.css";

export function RiderProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordBox, setShowPasswordBox] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const blackText = { color: "#000" };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
    cnic: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 👁️ SHOW/HIDE PASSWORD STATE
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await riderAPI.getProfile();
      setProfile(res.rider);

      setFormData({
        name: res.rider.name || "",
        phone: res.rider.phone || "",
        vehicleType: res.rider.vehicleType || "",
        vehicleNumber: res.rider.vehicleNumber || "",
        cnic: res.rider.cnic || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await riderAPI.updateProfile(formData);
      toast.success("Profile updated");
      setEditing(false);
      loadProfile();
    } catch {
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setChangingPassword(true);
      await riderAPI.changePassword(passwordData);
      toast.success("Password updated");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordBox(false);
    } catch {
      toast.error("Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("freshcartUser");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-page dashboard-rider">
      <RiderNavbar />

      <header className="rider-header">
        <h1 style={{color: "#ffffff"}}>Profile Settings</h1>
        <p style={{color: "#ffffff"}}>Manage your account and vehicle info</p>
      </header>

      {loading ? (
        <div className="rider-panel">
          <p style={blackText}>Loading...</p>
        </div>
      ) : (
        <>
          <section className="rider-panel" style={{ padding: "20px" }}>
            <h2 style={blackText}>{profile.name}</h2>
            <p style={blackText}>{profile.email}</p>
          </section>

          <section className="rider-panel">
            <div style={{ display: "grid", gap: "10px" }}>
              <p style={blackText}>📞 Phone: {profile.phone || "-"}</p>
              <p style={blackText}>🏙 City: {profile.city || "-"}</p>
              <p style={blackText}>🚗 Vehicle: {profile.vehicleType || "-"}</p>
              <p style={blackText}>🔢 Number: {profile.vehicleNumber || "-"}</p>
              <p style={blackText}>🪪 CNIC: {profile.cnic ? "*****" : "-"}</p>
            </div>
          </section>

          <section
            className="rider-panel"
            style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
          >
            <button onClick={() => setEditing(!editing)} style={btnPrimary}>
              {editing ? "Cancel Edit" : "Edit Profile"}
            </button>

            <button
              onClick={() => setShowPasswordBox(true)}
              style={btnSecondary}
            >
              Change Password
            </button>

            <button onClick={logout} style={btnDanger}>
              Logout
            </button>
          </section>

          {editing && (
            <section className="rider-panel">
              <form
                onSubmit={saveProfile}
                style={{ display: "grid", gap: "10px" }}
              >
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
                <input name="vehicleType" value={formData.vehicleType} onChange={handleChange} placeholder="Vehicle Type" />
                <input name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="Vehicle Number" />
                <input name="cnic" value={formData.cnic} onChange={handleChange} placeholder="CNIC" />

                <button type="submit" disabled={submitting} style={btnPrimary}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>
          )}

          {/* PASSWORD MODAL */}
          {showPasswordBox && (
            <div style={modalOverlay}>
              <div style={modalBox}>
                <h3 style={blackText}>Change Password</h3>

                <form
                  onSubmit={changePassword}
                  style={{ display: "grid", gap: "10px" }}
                >
                  {/* CURRENT */}
                  <div style={inputWrap}>
                    <input
                      type={showPass.current ? "text" : "password"}
                      name="currentPassword"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      style={inputStyle}
                    />
                    <span
                      style={eye}
                      onClick={() =>
                        setShowPass((p) => ({ ...p, current: !p.current }))
                      }
                    >
                      {showPass.current ? "🙈" : "👁️"}
                    </span>
                  </div>

                  {/* NEW */}
                  <div style={inputWrap}>
                    <input
                      type={showPass.new ? "text" : "password"}
                      name="newPassword"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      style={inputStyle}
                    />
                    <span
                      style={eye}
                      onClick={() =>
                        setShowPass((p) => ({ ...p, new: !p.new }))
                      }
                    >
                      {showPass.new ? "🙈" : "👁️"}
                    </span>
                  </div>

                  {/* CONFIRM */}
                  <div style={inputWrap}>
                    <input
                      type={showPass.confirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      style={inputStyle}
                    />
                    <span
                      style={eye}
                      onClick={() =>
                        setShowPass((p) => ({ ...p, confirm: !p.confirm }))
                      }
                    >
                      {showPass.confirm ? "🙈" : "👁️"}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    style={btnPrimary}
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasswordBox(false)}
                    style={btnDanger}
                  >
                    Close
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* STYLES */
const btnPrimary = {
  background: "#884e69",
  color: "#fff",
  padding: "10px 14px",
  border: "none",
  borderRadius: "6px",
};

const btnSecondary = {
  background: "#10b981",
  color: "#fff",
  padding: "10px 14px",
  border: "none",
  borderRadius: "6px",
};

const btnDanger = {
  background: "#ef4444",
  color: "#fff",
  padding: "10px 14px",
  border: "none",
  borderRadius: "6px",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "350px",
};

const inputWrap = {
  position: "relative",
};

const inputStyle = {
  width: "100%",
  padding: "11px 40px 11px 12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px",
};

const eye = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
};