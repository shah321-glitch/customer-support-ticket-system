import React, { useState } from "react";
import { X, Mail, Lock, User, Shield, AlertCircle } from "lucide-react";
import { api } from "../api";

const AuthModal = ({ isOpen, onClose, initialMode = "login", onAuthSuccess, showToast }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let data;
      if (mode === "register") {
        data = await api.register(formData);
        showToast("Account created successfully!", "success");
      } else {
        data = await api.login({ email: formData.email, password: formData.password });
        showToast("Signed in successfully!", "success");
      }

      localStorage.setItem("token", data.token);
      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="card-panel"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "30px",
          background: "var(--bg-card)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              {mode === "login" ? "Sign in to manage and reply to tickets" : "Join the support portal"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--danger-bg)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "14px", top: "13px", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: "38px" }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "13px", color: "var(--text-muted)" }} />
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: "38px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "13px", color: "var(--text-muted)" }} />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: "38px" }}
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Account Role
              </label>
              <div style={{ position: "relative" }}>
                <Shield size={16} style={{ position: "absolute", left: "14px", top: "13px", color: "var(--text-muted)" }} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: "38px" }}
                >
                  <option value="customer">Customer (Ticket Submitter)</option>
                  <option value="agent">Support Agent (Solves Tickets)</option>
                  <option value="admin">Administrator (Full Control)</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "12px", marginTop: "4px" }}
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => { setMode("register"); setError(""); }}
                style={{ color: "#818cf8", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              >
                Create one now
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => { setMode("login"); setError(""); }}
                style={{ color: "#818cf8", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              >
                Sign in
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
