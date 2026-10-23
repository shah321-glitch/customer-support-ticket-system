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
  Shield, 
  Headphones, 
  Crown,
  AlertCircle 
} from "lucide-react";

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

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

  const roles = [
    { id: "customer", label: "Customer", icon: User, desc: "Submit tickets & get help" },
    { id: "agent", label: "Support Agent", icon: Headphones, desc: "Triage & resolve tickets" },
    { id: "admin", label: "Administrator", icon: Crown, desc: "Full administrative access" },
  ];

  return (
    <div className="auth-page-container">
      {/* Background glow decoration */}
      <div
        style={{
          position: "absolute",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)",
          top: "10%",
          right: "15%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)",
          bottom: "10%",
          left: "15%",
          pointerEvents: "none",
        }}
      />

      <div className="auth-card" style={{ maxWidth: "520px" }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
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
            Create Your Account
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Join ResolveDesk to manage your service requests
          </p>
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

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: "16px" }}>
            <label className="form-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }}
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aman Verma"
                className="form-input"
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div style={{ marginBottom: "18px" }}>
            <label className="form-label">Password (Min 6 characters)</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
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

          {/* Role Selection */}
          <div style={{ marginBottom: "24px" }}>
            <label className="form-label">Select Account Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: "12px 8px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "2px solid var(--accent-teal)" : "1px solid var(--border-color)",
                      background: isSelected ? "var(--primary-light)" : "var(--bg-input)",
                      color: isSelected ? "var(--accent-teal)" : "var(--text-secondary)",
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "13px", fontSize: "14px", fontWeight: 700 }}
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create ResolveDesk Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch to Login */}
        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--accent-teal)", fontWeight: 700, textDecoration: "none" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

