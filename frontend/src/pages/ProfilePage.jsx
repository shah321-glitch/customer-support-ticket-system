import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Check, 
  LogOut, 
  Sun, 
  Moon, 
  Crown, 
  Headphones,
  LifeBuoy
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, logout, theme, toggleTheme, showToast } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user._id);
    setCopied(true);
    showToast("User ID copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleDetails = () => {
    switch (user.role) {
      case "admin":
        return {
          title: "System Administrator",
          icon: Crown,
          color: "#ef4444",
          badgeBg: "rgba(239, 68, 68, 0.15)",
          desc: "Full administrative authority across all tickets, agents, analytics, and data deletion.",
          privileges: [
            "Create & manage support tickets",
            "Update ticket status, priority, and assign specialists",
            "Delete tickets and clean logs",
            "View real-time department analytics and charts",
            "Full RBAC control and audit access",
          ],
        };
      case "agent":
        return {
          title: "Support Specialist (Agent)",
          icon: Headphones,
          color: "#f59e0b",
          badgeBg: "rgba(245, 158, 11, 0.15)",
          desc: "Triage and resolve customer tickets, collaborate with customers, and manage workflow phases.",
          privileges: [
            "View global ticket queue and triage requests",
            "Respond to customer conversation threads",
            "Transition status (Open -> In Progress -> Resolved)",
            "Re-assign tickets across support specialists",
          ],
        };
      default:
        return {
          title: "Customer Account",
          icon: User,
          color: "var(--accent-teal)",
          badgeBg: "var(--primary-light)",
          desc: "Submit service incidents, collaborate with support agents, and track issue resolution.",
          privileges: [
            "Submit unlimited support tickets with file attachments",
            "Track live progress & SLA response timers",
            "Chat directly with assigned support technicians",
            "Submit 5-star customer feedback upon resolution",
          ],
        };
    }
  };

  const roleInfo = getRoleDetails();
  const RoleIcon = roleInfo.icon;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Breadcrumb Trail */}
      <div className="breadcrumb-trail">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <span className="breadcrumb-active">User Profile</span>
      </div>

      {/* Main Profile Header Card */}
      <div
        className="card-panel"
        style={{
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          background: "linear-gradient(135deg, rgba(13, 148, 136, 0.14) 0%, rgba(6, 182, 212, 0.08) 100%)",
          border: "1px solid rgba(20, 184, 166, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Large Avatar */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: user.role === "admin" 
                ? "linear-gradient(135deg, #ef4444, #dc2626)" 
                : user.role === "agent" 
                ? "linear-gradient(135deg, #f59e0b, #d97706)" 
                : "linear-gradient(135deg, #0d9488, #14b8a6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 900,
              color: "#fff",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
              flexShrink: 0,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.4px" }}>
                {user.name}
              </h2>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: "14px",
                  background: roleInfo.badgeBg,
                  color: roleInfo.color,
                  border: `1px solid ${roleInfo.color}40`,
                }}
              >
                {roleInfo.title}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ padding: "8px 14px", gap: "6px" }}
          >
            {theme === "dark" ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#0d9488" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            onClick={logout}
            className="btn btn-danger btn-sm"
            style={{ padding: "8px 14px", gap: "6px" }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Details & Role Permissions Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Account Details */}
        <div className="card-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>
            ACCOUNT INFORMATION
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>
                Unique Account ID
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontFamily: "monospace", color: "var(--text-primary)", fontWeight: 600 }}>
                  {user._id}
                </span>
                <button
                  onClick={handleCopyId}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  title="Copy ID"
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>
                Primary Email
              </span>
              <p style={{ color: "var(--text-primary)", fontWeight: 600, marginTop: "2px" }}>
                {user.email}
              </p>
            </div>

            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 700 }}>
                Security & Authentication
              </span>
              <p style={{ color: "var(--accent-teal)", fontWeight: 600, marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={16} />
                JWT Session Authenticated & Bcrypt Protected
              </p>
            </div>
          </div>
        </div>

        {/* Role Privileges */}
        <div className="card-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <RoleIcon size={18} color={roleInfo.color} />
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-secondary)" }}>
              ROLE PRIVILEGES
            </h3>
          </div>

          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: "1.5" }}>
            {roleInfo.desc}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {roleInfo.privileges.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12.5px",
                  color: "var(--text-primary)",
                }}
              >
                <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

