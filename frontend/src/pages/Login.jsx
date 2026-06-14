import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../style/auth.css";
import bgVideo from "../assets/137247-766338227.mp4";

import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

export function Login() {
  const navigate = useNavigate();

  // login / forgot / reset
  const [view, setView] = useState("login");

  // login form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // forgot password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const firebaseToken = await result.user.getIdToken();

      const response = await axios.post(
        "http://localhost:5000/api/auth/google-login",
        {
          token: firebaseToken,
        },
      );

      localStorage.setItem("freshcartToken", response.data.token);

      localStorage.setItem("freshcartUser", JSON.stringify(response.data.user));

      toast.success("Login successful");

      navigate(`/dashboard/${response.data.user.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );

      localStorage.setItem("freshcartToken", response.data.token);

      localStorage.setItem("freshcartUser", JSON.stringify(response.data.user));

      toast.success("Login successful");

      navigate(`/dashboard/${response.data.user.role}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setView("reset");
        setMessage(data.message || "Reset code sent successfully.");
        setIsError(false);
      } else {
        setMessage(data.message);
        setIsError(true);
      }
    } catch {
      setMessage("Something went wrong.");
      setIsError(true);
    }

    setLoading(false);
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful");
        setView("login");

        setEmail("");
        setCode("");
        setNewPassword("");
      } else {
        setMessage(data.message);
        setIsError(true);
      }
    } catch {
      setMessage("Something went wrong.");
      setIsError(true);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* VIDEO */}
      <div className="auth-right">
        <video autoPlay muted loop playsInline className="auth-video-right">
          <source src={bgVideo} type="video/mp4" />
        </video>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          {/* LEFT PANEL */}
          <div className="signup-panel">
            <div className="auth-badge">FreshCart 🥕</div>

            {view === "login" && (
              <>
                <h1>Login</h1>

                <p className="auth-subtitle">Welcome back! Please sign in.</p>

                <form className="auth-form" onSubmit={handleLogin}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button type="submit">Login</button>

                  <button
                    type="button"
                    onClick={googleLogin}
                    className="google-btn"
                  >
                    Sign in with Google
                  </button>

                  <a
                    onClick={(e) => {
                      e.preventDefault();

                      setView("forgot");
                    }}
                    href="#"
                    style={{
                      color: "#555",
                      textDecoration: "underline",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    Forgot Password?
                  </a>
                </form>
              </>
            )}

            {view === "forgot" && (
              <>
                <h1>Forgot Password</h1>

                <p className="auth-subtitle">
                  Enter your email to receive a reset code.
                </p>

                <form className="auth-form" onSubmit={handleSendCode}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <button type="submit">
                    {loading ? "Sending..." : "Send Code"}
                  </button>

                  <button
                    type="button"
                    className="google-btn"
                    onClick={() => setView("login")}
                  >
                    Back to Login
                  </button>
                </form>
              </>
            )}
            {view === "reset" && (
              <>
                <h1>Reset Password</h1>

                <p className="auth-subtitle">
                  Enter the code sent to your email and choose a new password.
                </p>

                <form className="auth-form" onSubmit={handleResetPassword}>
                  <input
                    type="text"
                    placeholder="Verification Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <button type="submit">
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    className="google-btn"
                    onClick={() => setView("login")}
                  >
                    Back to Login
                  </button>
                </form>
              </>
            )}

            {message && (
              <p className={isError ? "error" : "success"}>{message}</p>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="welcome-panel right">
            <h2>Welcome Back!</h2>

            <span className="welcome-info">Don’t have an account yet?</span>

            <Link to="/register" className="welcome-btn">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
