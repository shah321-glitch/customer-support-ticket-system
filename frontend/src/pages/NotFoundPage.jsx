import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Ticket, LifeBuoy, ArrowLeft, Layers, Compass } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        textAlign: "center",
      }}
    >
      <div className="card-panel" style={{ maxWidth: "560px", padding: "48px 36px" }}>
        {/* Glowing Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "var(--primary-light)",
            border: "1px solid rgba(20, 184, 166, 0.3)",
            color: "var(--accent-teal)",
            fontSize: "12px",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          <Compass size={14} />
          <span>ERROR 404 • ROUTE UNRESOLVED</span>
        </div>

        {/* 404 Heading */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-2px",
            background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "16px",
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.4px", marginBottom: "8px" }}>
          Lost in Support Space?
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", maxWidth: "420px", margin: "0 auto 28px" }}>
          We could not find the page or ticket route you were looking for. It might have been moved or removed.
        </p>

        {/* Action Shortcuts */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>
          <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: "none", fontSize: "13px" }}>
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </Link>
          <Link to="/tickets" className="btn btn-secondary" style={{ textDecoration: "none", fontSize: "13px" }}>
            <Ticket size={14} />
            <span>Ticket Queue</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

