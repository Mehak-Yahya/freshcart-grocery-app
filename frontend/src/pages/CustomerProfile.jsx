import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customerAPI } from "../services/api.js";
import CustomerNav from "../components/customernav";
import "../style/customer.css";

export function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [showPasswordBox, setShowPasswordBox] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
      const res = await customerAPI.getProfile();
      const user = res.user;

      setProfile(user);

      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        city: user.city || "",
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

  // ================= SAVE PROFILE =================
  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await customerAPI.updateProfile(formData);

      toast.success("Profile updated");
      setEditing(false);
      loadProfile();
    } catch {
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= CHANGE PASSWORD =================
  const changePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setChangingPassword(true);

      await customerAPI.changePassword(passwordData);

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
    localStorage.removeItem("freshcartToken");
    window.location.replace("/login");
  };

  return (
    <div className="dashboard-page dashboard-customer">
<CustomerNav />
      <header className="customer-header-profile">
        <h1>Profile Settings</h1>
        <p>Manage your account details</p>
      </header>

      {loading ? (
        <div className="customer-panel">Loading...</div>
      ) : (
        <>
          {/* PROFILE INFO */}
          <section className="customer-panel" style={{ padding: "20px" }}>
            <h2>{profile?.name}</h2>
            <p>{profile?.email}</p>
          </section>

          <section className="customer-panel">
            <div style={{ display: "grid", gap: "10px" }}>
              <p>📞 Phone: {profile?.phone || "-"}</p>
              <p>🏙 City: {profile?.city || "-"}</p>
            </div>
          </section>

          {/* ACTION BUTTONS (SAME RIDER STYLE) */}
          <section
            className="customer-panel"
            style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
          >
            <button onClick={() => setEditing(!editing)}>
              {editing ? "Cancel Edit" : "Edit Profile"}
            </button>

            <button onClick={() => setShowPasswordBox(true)}>
              Change Password
            </button>

            <button
              onClick={logout}
              style={{ background: "#ef4444", color: "#fff" }}
            >
              Logout
            </button>
          </section>

          {/* EDIT FORM */}
          {editing && (
            <section className="customer-panel">
              <form onSubmit={saveProfile} style={{ display: "grid", gap: "10px" }}>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                />

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />

                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />

                <button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>
          )}

          {/* PASSWORD MODAL (EXACT RIDER STYLE) */}
          {showPasswordBox && (
            <div style={modalOverlay}>
              <div style={modalBox}>
                <h3>Change Password</h3>

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

/* ================= SAME RIDER STYLE MODAL ================= */

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