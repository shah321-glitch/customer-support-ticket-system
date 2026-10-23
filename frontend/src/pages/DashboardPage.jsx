import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  ArrowRight, 
  PlusCircle, 
  RefreshCw, 
  Clock, 
  MessageSquare, 
  Paperclip, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Ticket
} from "lucide-react";
import MetricCards from "../components/MetricCards";
import DashboardCharts from "../components/DashboardCharts";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (force = false) => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.getStats(force).catch(() => null),
        api.getTickets({}, 1, 5).catch(() => ({ tickets: [] })),
      ]);

      if (statsRes) setStats(statsRes);
      if (ticketsRes && ticketsRes.tickets) {
        setRecentTickets(ticketsRes.tickets);
      } else if (Array.isArray(ticketsRes)) {
        setRecentTickets(ticketsRes.slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      default:
        return "priority-low";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "badge-open";
      case "In Progress":
        return "badge-progress";
      case "Resolved":
        return "badge-resolved";
      default:
        return "badge-closed";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0" }}>
        <LoadingSpinner text="Loading support intelligence dashboard..." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Welcome Banner */}
      <div
        className="card-panel"
        style={{
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)",
          borderColor: "rgba(20, 184, 166, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-teal)", letterSpacing: "0.5px" }}>
              OPERATION OVERVIEW
            </span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent-teal)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.4px" }}>
            Welcome back, {user?.name || "Member"}! 👋
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Here is the current operational health of your customer support queue.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh Metrics"
          >
            <RefreshCw size={14} className={refreshing ? "spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          {user?.role === "customer" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/tickets/new")}
            >
              <PlusCircle size={14} />
              <span>Create Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top 4 Wave Gradient Metric Cards */}
      <MetricCards stats={stats} />

      {/* 3. Interactive Analytics & Distribution Charts */}
      <DashboardCharts stats={stats} />

      {/* 4. Recent Tickets Section */}
      <div className="card-panel" style={{ padding: "24px 28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "-0.3px" }}>
              Recent Support Tickets
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Latest customer issues submitted to the triage queue
            </p>
          </div>

          <button
            onClick={() => navigate("/tickets")}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span>View All Tickets</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentTickets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "var(--bg-input)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <CheckCircle2 size={36} color="var(--accent-teal)" style={{ marginBottom: "12px" }} />
            <h4 style={{ fontSize: "15px", fontWeight: 700 }}>No tickets currently in the queue</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Great job! All issues are addressed or no new tickets have been logged.
            </p>
            {user?.role === "customer" ? (
              <button
                onClick={() => navigate("/tickets/new")}
                className="btn btn-primary btn-sm"
                style={{ marginTop: "16px" }}
              >
                <PlusCircle size={14} />
                <span>Raise First Ticket</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/tickets")}
                className="btn btn-primary btn-sm"
                style={{ marginTop: "16px" }}
              >
                <Ticket size={14} />
                <span>View Ticket Queue</span>
              </button>
            )}
          </div>
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Ticket / Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr
                    key={t._id}
                    className="table-row-clickable"
                    onClick={() => navigate(`/tickets/${t._id}`)}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                          {t.title}
                        </span>
                        {t.attachment?.url && (
                          <span title="File attached">
                            <Paperclip size={13} color="var(--accent-teal)" />
                          </span>
                        )}
                        {t.comments?.length > 0 && (
                          <span
                            title={`${t.comments.length} comments`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              fontSize: "11px",
                              color: "var(--text-muted)",
                            }}
                          >
                            <MessageSquare size={12} />
                            {t.comments.length}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        #{t._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-category">{t.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityClass(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {t.createdBy?.name || "Customer"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${t._id}`);
                        }}
                      >
                        <ExternalLink size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

