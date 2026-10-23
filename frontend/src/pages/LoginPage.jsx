import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Layers, 
  ShieldCheck, 
  User, 
  Headphones, 
  Crown,
  AlertCircle 
} from "lucide-react";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="auth-page-container">
      {/* Background glow decoration */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)",
          top: "10%",
          left: "20%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
          bottom: "10%",
          right: "15%",
          pointerEvents: "none",
        }}
      />

      <div className="auth-card">
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(20, 184, 166, 0.4)",
              marginBottom: "12px",
            }}
          >
            <Layers size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>
            Welcome to <span style={{ color: "var(--accent-teal)" }}>ResolveDesk</span>
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Sign in to access your tickets and support portal
          </p>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <ShieldCheck size={14} color="var(--accent-teal)" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>
              QUICK 1-CLICK DEMO ACCOUNTS:
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="quick-demo-pill"
              onClick={() => handleQuickDemo("aman@example.com", "password123")}
              title="Aman Verma (Customer)"
            >
              <User size={12} style={{ display: "inline", marginRight: "4px" }} />
              Customer
            </button>
            <button
              type="button"
              className="quick-demo-pill"
              onClick={() => handleQuickDemo("agent1@example.com", "password123")}
              title="Agent Sarah (Support Agent)"
            >
              <Headphones size={12} style={{ display: "inline", marginRight: "4px" }} />
              Support Agent
            </button>
            <button
              type="button"
              className="quick-demo-pill"
              onClick={() => handleQuickDemo("admin@example.com", "password123")}
              title="Admin User (System Administrator)"
            >
              <Crown size={12} style={{ display: "inline", marginRight: "4px" }} />
              Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: "12px 14px",
              background: "var(--danger-bg)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "var(--radius-md)",
              color: "#f87171",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div style={{ marginBottom: "16px" }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-input"
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: "40px", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 700 }}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In to ResolveDesk</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch to Register */}
        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Don't have an account yet?{" "}
          <Link
            to="/register"
            style={{ color: "var(--accent-teal)", fontWeight: 700, textDecoration: "none" }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

