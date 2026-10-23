import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  LifeBuoy, 
  Sun, 
  Moon, 
  LogOut, 
  LogIn, 
  UserPlus,
  Layers,
  Sparkles,
  User,
  Award
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ openTicketCount = 0 }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const corePages = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tickets", label: "Ticket Queue", icon: Ticket, badge: openTicketCount },
    ...(user?.role === "customer"
      ? [
          { to: "/tickets/new", label: "Create Ticket", icon: PlusCircle },
          { to: "/knowledge", label: "Knowledge Base", icon: LifeBuoy },
        ]
      : []),
    ...(user?.role === "admin"
      ? [
          { to: "/admin/agent-performance", label: "Agent Performance", icon: Award },
        ]
      : []),
  ];

  const accountPages = [
    { to: "/profile", label: "My Profile", icon: User },
  ];

  const renderNavLink = ({ to, label, icon: Icon, badge }) => (
    <NavLink
      key={to}
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        background: isActive
          ? "linear-gradient(135deg, rgba(13, 148, 136, 0.25) 0%, rgba(20, 184, 166, 0.1) 100%)"
          : "transparent",
        color: isActive ? "var(--accent-teal)" : "var(--text-secondary)",
        fontWeight: isActive ? 700 : 500,
        fontSize: "13.5px",
        transition: "all 0.15s ease",
        borderLeft: isActive ? "3px solid var(--accent-teal)" : "3px solid transparent",
      })}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Icon size={17} />
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span
          style={{
            background: "var(--accent-teal)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 800,
            padding: "1px 7px",
            borderRadius: "12px",
          }}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <aside className="sidebar-wrapper" style={{ overflowY: "auto" }}>
      {/* 1. Brand Logo */}
      <div
        onClick={() => navigate("/dashboard")}
        style={{
          padding: "22px 20px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid var(--border-color)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(20, 184, 166, 0.4)",
            flexShrink: 0,
          }}
        >
          <Layers size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.3px", color: "var(--text-primary)" }}>
            RESOLVE<span style={{ color: "var(--accent-teal)" }}>DESK</span>
          </h2>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
            Management Portal
          </span>
        </div>
      </div>

      {/* 2. Primary Navigation Links */}
      <div style={{ padding: "16px 14px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {/* Core Pages Group */}
        <span style={{ fontSize: "10.5px", fontWeight: 800, color: "var(--text-muted)", paddingLeft: "8px", marginBottom: "4px", letterSpacing: "0.5px" }}>
          CORE WORKSPACE
        </span>
        {corePages.map(renderNavLink)}

        {/* Action Button: Quick Raise Ticket (Customers Only) */}
        {user?.role === "customer" && (
          <div style={{ margin: "10px 0 16px", padding: "0 2px" }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-md)", fontSize: "13px" }}
              onClick={() => navigate("/tickets/new")}
            >
              <PlusCircle size={15} />
              <span>Raise New Ticket</span>
            </button>
          </div>
        )}

        {/* Account Section */}
        <span style={{ fontSize: "10.5px", fontWeight: 800, color: "var(--text-muted)", paddingLeft: "8px", marginBottom: "4px", letterSpacing: "0.5px" }}>
          ACCOUNT SETTINGS
        </span>
        {accountPages.map(renderNavLink)}

        {/* System Status Widget */}
        <div
          style={{
            marginTop: "auto",
            padding: "12px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "11.5px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>SYSTEM STATUS</span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "11px", lineHeight: "1.4", margin: 0 }}>
            Operational • Real-time SLA response tracking active.
          </p>
        </div>
      </div>

      {/* 3. Bottom User Profile & Theme Bar */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid var(--border-color)",
          background: "var(--bg-card)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {user ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div 
              onClick={() => navigate("/profile")}
              style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, cursor: "pointer" }}
              title="View Profile Details"
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background:
                    user.role === "admin"
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : user.role === "agent"
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : "linear-gradient(135deg, #0d9488, #14b8a6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </p>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color:
                      user.role === "admin"
                        ? "#f87171"
                        : user.role === "agent"
                        ? "#fbbf24"
                        : "var(--accent-teal)",
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={toggleTheme}
                title="Toggle Theme"
                style={{ padding: "6px 8px" }}
              >
                {theme === "dark" ? <Sun size={14} color="#fbbf24" /> : <Moon size={14} color="#0d9488" />}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Sign Out"
                style={{ padding: "6px 8px" }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => navigate("/login")}
            >
              <LogIn size={14} />
              <span>Login</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
              onClick={() => navigate("/register")}
            >
              <UserPlus size={14} />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
