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
  User, 
  Headphones, 
  Crown,
  AlertCircle,
  Sparkles
} from "lucide-react";
import AuroraAuthWrapper from "../components/AuroraAuthWrapper";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ripples, setRipples] = useState([]);

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

  const handleButtonClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <AuroraAuthWrapper>
      {/* 1. Floating Logo with Accent Gradient */}
      <div className="aurora-logo-container stagger-item stagger-1">
        <div className="aurora-logo-badge">
          <Layers size={28} color="#ffffff" />
        </div>
      </div>

      {/* 2. Heading with Violet-to-White Text Gradient */}
      <h1 className="aurora-heading stagger-item stagger-2">
        Welcome to ResolveDesk
      </h1>
      <p className="aurora-subtitle stagger-item stagger-2">
        Sign in to access your tickets and support portal
      </p>

      {/* 3. Quick 1-Click Demo Accounts Bar */}
      <div className="aurora-quick-demo-box stagger-item stagger-3">
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Sparkles size={14} color="var(--aurora-cyan)" />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--aurora-text-muted)", letterSpacing: "0.5px" }}>
            QUICK 1-CLICK DEMO ACCOUNTS:
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="aurora-quick-demo-pill"
            onClick={() => handleQuickDemo("rahul@customer.com", "Password@123")}
            title="Rahul Sharma (Customer)"
          >
            <User size={12} style={{ display: "inline", marginRight: "4px" }} />
            Customer
          </button>
          <button
            type="button"
            className="aurora-quick-demo-pill"
            onClick={() => handleQuickDemo("vikram@agent.com", "Password@123")}
            title="Agent Vikram (Support Agent)"
          >
            <Headphones size={12} style={{ display: "inline", marginRight: "4px" }} />
            Support Agent
          </button>
          <button
            type="button"
            className="aurora-quick-demo-pill"
            onClick={() => handleQuickDemo("admin@resolvedesk.com", "Password@123")}
            title="System Administrator (Admin)"
          >
            <Crown size={12} style={{ display: "inline", marginRight: "4px" }} />
            Admin
          </button>
        </div>
      </div>

      {/* 4. Error Feedback with Red Shake */}
      {error && (
        <div className="aurora-alert-error" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* 5. Login Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Address */}
        <div className="aurora-field-group stagger-item stagger-4">
          <label className="aurora-label" htmlFor="login-email">
            Email Address
          </label>
          <div className="aurora-input-wrapper">
            <Mail size={18} className="aurora-input-icon" />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="name@example.com"
              className="aurora-input"
            />
            <div className="aurora-input-line" />
          </div>
        </div>

        {/* Password */}
        <div className="aurora-field-group stagger-item stagger-5" style={{ marginBottom: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="aurora-label" htmlFor="login-password">
              Password
            </label>
          </div>
          <div className="aurora-input-wrapper">
            <Lock size={18} className="aurora-input-icon" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="••••••••"
              className="aurora-input"
            />
            <div className="aurora-input-line" />

            <button
              type="button"
              className="aurora-eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button with Continuous Glow, Sweep Shine, & Ripple */}
        <div className="stagger-item stagger-6">
          <button
            type="submit"
            disabled={loading}
            onClick={handleButtonClick}
            className="aurora-btn-submit"
          >
            {/* Click Ripple Elements */}
            {ripples.map((rip) => (
              <span
                key={rip.id}
                className="aurora-btn-ripple"
                style={{
                  left: rip.x - 20,
                  top: rip.y - 20,
                  width: 40,
                  height: 40,
                }}
              />
            ))}

            {loading ? (
              <>
                <div className="aurora-btn-spinner" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to ResolveDesk</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Link with Animated Underline */}
      <div className="aurora-footer-switch stagger-item stagger-7">
        Don't have an account yet?
        <Link to="/register" className="aurora-footer-link">
          Create an account
        </Link>
      </div>
    </AuroraAuthWrapper>
  );
};

export default LoginPage;
