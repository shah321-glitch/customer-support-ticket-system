import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Layers, 
  Headphones, 
  Crown,
  AlertCircle,
  Check
} from "lucide-react";
import AuroraAuthWrapper from "../components/AuroraAuthWrapper";

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ripples, setRipples] = useState([]);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Visual password strength calculator (does not block submission)
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "", color: "transparent" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10 || /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: "Weak", color: "#ef4444" };
      case 2:
        return { score: 2, text: "Fair", color: "#f97316" };
      case 3:
        return { score: 3, text: "Good", color: "#f59e0b" };
      case 4:
        return { score: 4, text: "Strong", color: "#10b981" };
      default:
        return { score: 0, text: "", color: "transparent" };
    }
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password, role);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const roles = [
    { id: "customer", label: "Customer", icon: User, desc: "Submit tickets & get help" },
    { id: "agent", label: "Support Agent", icon: Headphones, desc: "Triage & resolve tickets" },
    { id: "admin", label: "Administrator", icon: Crown, desc: "Full administrative access" },
  ];

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
        Create Your Account
      </h1>
      <p className="aurora-subtitle stagger-item stagger-2">
        Join ResolveDesk to manage your service requests
      </p>

      {/* 3. Validation / Error Feedback with Red Shake */}
      {error && (
        <div className="aurora-alert-error" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Registration Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="aurora-field-group stagger-item stagger-3">
          <label className="aurora-label" htmlFor="register-name">
            Full Name
          </label>
          <div className="aurora-input-wrapper">
            <User size={18} className="aurora-input-icon" />
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Rahul Sharma"
              className="aurora-input"
            />
            <div className="aurora-input-line" />
          </div>
        </div>

        {/* Email Address */}
        <div className="aurora-field-group stagger-item stagger-4">
          <label className="aurora-label" htmlFor="register-email">
            Email Address
          </label>
          <div className="aurora-input-wrapper">
            <Mail size={18} className="aurora-input-icon" />
            <input
              id="register-email"
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
        <div className="aurora-field-group stagger-item stagger-5">
          <label className="aurora-label" htmlFor="register-password">
            Password (Min 6 characters)
          </label>
          <div className="aurora-input-wrapper">
            <Lock size={18} className="aurora-input-icon" />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
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

          {/* Visual Password Strength Bar */}
          {password.length > 0 && (
            <div className="password-strength-container">
              <div className="password-strength-bars">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className="password-strength-segment"
                    style={{
                      background: strength.score >= seg ? strength.color : "rgba(255, 255, 255, 0.08)",
                      boxShadow: strength.score >= seg ? `0 0 8px ${strength.color}` : "none",
                    }}
                  />
                ))}
              </div>
              <div className="password-strength-text" style={{ color: strength.color }}>
                <span>Security: {strength.text}</span>
                <span style={{ fontSize: "10.5px", color: "var(--aurora-text-muted)" }}>
                  {password.length < 6 ? "Minimum 6 chars needed" : "Valid length"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Role Selector (3 Equal Interactive Cards) */}
        <div className="stagger-item stagger-6" style={{ marginBottom: "24px" }}>
          <label className="aurora-label">Select Account Role</label>
          <div className="aurora-roles-grid" role="radiogroup" aria-label="Account Role">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <div
                  key={r.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`aurora-role-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setRole(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setRole(r.id);
                    }
                  }}
                >
                  {/* Animated Corner Check Badge */}
                  {isSelected && (
                    <div className="aurora-role-check-badge">
                      <Check size={11} color="#ffffff" strokeWidth={3} />
                    </div>
                  )}

                  <Icon size={22} className="aurora-role-icon" />
                  <span className="aurora-role-label">{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button with Continuous Glow, Sweep Shine, & Ripple */}
        <div className="stagger-item stagger-7">
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
                <span>Creating account…</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create ResolveDesk Account</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Link with Animated Underline */}
      <div className="aurora-footer-switch stagger-item stagger-7">
        Already have an account?
        <Link to="/login" className="aurora-footer-link">
          Sign in
        </Link>
      </div>
    </AuroraAuthWrapper>
  );
};

export default RegisterPage;
