import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, PlusCircle, Bell, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TopBar = ({ searchQuery = "", onSearchChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/") {
      return {
        title: "Operations Dashboard",
        subtitle: user ? `Welcome back, ${user.name}` : "Support metrics & operations",
      };
    }
    if (path === "/tickets") {
      return {
        title: user?.role === "agent" ? "My Assigned Tickets" : "Support Ticket Queue",
        subtitle: user?.role === "agent"
          ? "Viewing tickets assigned to you by administrator"
          : user?.role === "customer"
          ? "Track and manage your submitted support requests"
          : "Review, filter, assign, and triage customer requests",
      };
    }
    if (path === "/tickets/new") {
      return {
        title: "Create Support Ticket",
        subtitle: "Submit a new incident or service request",
      };
    }
    if (path.startsWith("/tickets/")) {
      return {
        title: "Ticket Details & Conversation",
        subtitle: "Collaborate, update status, and resolve issues",
      };
    }
    if (path === "/knowledge") {
      return {
        title: "Knowledge Base & FAQs",
        subtitle: "Instant solutions and troubleshooting articles",
      };
    }
    return {
      title: "ResolveDesk Support Portal",
      subtitle: "Customer support ticket management",
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header
      style={{
        padding: "16px 28px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {location.pathname !== "/dashboard" && location.pathname !== "/" && (
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 8px", marginRight: "4px" }}
              title="Go back"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <h1 style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.4px" }}>
            {title}
          </h1>
          {user && (
            <span
              style={{
                fontSize: "11px",
                background: "var(--primary-light)",
                color: "var(--accent-teal)",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 700,
              }}
            >
              {user.role.toUpperCase()}
            </span>
          )}
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
          {subtitle}
        </p>
      </div>

      {/* Right controls: Search & Quick actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        {/* Search bar */}
        <div style={{ position: "relative", minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => {
              if (onSearchChange) {
                onSearchChange(e.target.value);
              } else {
                navigate(`/tickets?search=${encodeURIComponent(e.target.value)}`);
              }
            }}
            className="form-input"
            style={{ paddingLeft: "38px", height: "40px", fontSize: "13px" }}
          />
        </div>

        {/* Raise Ticket Button (Only for Customers) */}
        {user?.role === "customer" && (
          <button
            className="btn btn-primary"
            onClick={() => navigate("/tickets/new")}
            style={{ height: "40px", padding: "0 18px" }}
          >
            <PlusCircle size={16} />
            <span>New Ticket</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
