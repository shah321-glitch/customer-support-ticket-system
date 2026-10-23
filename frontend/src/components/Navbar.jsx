import React from "react";
import { Ticket, LifeBuoy, PlusCircle, LogIn, UserPlus, LogOut, User, Shield, Sun, Moon } from "lucide-react";

const Navbar = ({
  activeTab,
  onTabChange,
  user,
  onOpenAuth,
  onLogout,
  onOpenCreateTicket,
  openTicketCount = 0,
  theme = "dark",
  onToggleTheme,
}) => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--border-color)",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1360px",
          margin: "0 auto",
          minHeight: "68px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "10px 0",
        }}
      >
        {/* Left: Brand Logo & Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
          {/* Logo */}
          <div
            onClick={() => onTabChange("tickets")}
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
              }}
            >
              <Ticket size={20} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.4px" }}>
                Resolve<span style={{ color: "var(--primary)" }}>Desk</span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => onTabChange("tickets")}
              style={{
                background: activeTab === "tickets" ? "var(--primary-light)" : "transparent",
                color: activeTab === "tickets" ? "var(--text-primary)" : "var(--text-secondary)",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.15s ease",
              }}
            >
              <Ticket size={16} />
              <span>Tickets</span>
              {openTicketCount > 0 && (
                <span
                  style={{
                    background: "var(--primary)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: "10px",
                  }}
                >
                  {openTicketCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("knowledge")}
              style={{
                background: activeTab === "knowledge" ? "var(--primary-light)" : "transparent",
                color: activeTab === "knowledge" ? "var(--text-primary)" : "var(--text-secondary)",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.15s ease",
              }}
            >
              <LifeBuoy size={16} />
              <span>Help Center</span>
            </button>
          </nav>
        </div>

        {/* Right: User Profile & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Theme Toggle Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{ padding: "8px 10px", borderRadius: "8px" }}
          >
            {theme === "dark" ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
          </button>

          {user ? (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenCreateTicket}
              >
                <PlusCircle size={15} />
                <span>New Ticket</span>
              </button>

              {/* User Profile Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  padding: "5px 12px 5px 6px",
                  borderRadius: "24px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: user.role === "admin" ? "#dc2626" : user.role === "agent" ? "#d97706" : "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "12px",
                    color: "#fff",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ lineHeight: 1.2 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600 }}>{user.name}</p>
                  <span
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: user.role === "admin" ? "#f87171" : user.role === "agent" ? "#fbbf24" : "#60a5fa",
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={onLogout}
                title="Sign Out"
                style={{ padding: "8px 10px" }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenAuth("login")}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth("register")}
              >
                <UserPlus size={15} />
                <span>Get Started</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
