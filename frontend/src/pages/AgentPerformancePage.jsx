import React, { useState, useEffect } from "react";
import { 
  Award, 
  Users, 
  CheckCircle2, 
  Clock, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const AgentPerformancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    summary: {
      totalAgents: 0,
      totalAssignedTeam: 0,
      totalResolvedTeam: 0,
      overallTeamResolutionRate: 0,
      teamAvgRating: 5.0,
      totalTeamReviews: 0,
    },
    agents: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAgentId, setExpandedAgentId] = useState(null);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAgentPerformance();
      setData(res);
    } catch (err) {
      console.error("Failed to load agent performance:", err);
      setError(err.message || "Failed to load agent performance metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const toggleExpand = (agentId) => {
    setExpandedAgentId((prev) => (prev === agentId ? null : agentId));
  };

  const filteredAgents = (data.agents || []).filter((agent) => {
    const q = searchTerm.toLowerCase();
    return (
      agent.name.toLowerCase().includes(q) ||
      agent.email.toLowerCase().includes(q) ||
      agent.role.toLowerCase().includes(q)
    );
  });

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rounded ? "#f59e0b" : "transparent"}
            color={star <= rounded ? "#f59e0b" : "var(--text-muted)"}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* 1. Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(20, 184, 166, 0.35)",
              }}
            >
              <Award size={20} color="#fff" />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
              Support Agent Performance
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
            Real-time tracking of agent ticket assignments, resolution velocity, and verified customer 5-star feedback.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchPerformance}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {/* KPI 1: Active Agents */}
        <div
          className="card-panel"
          style={{
            padding: "18px 20px",
            background: "linear-gradient(135deg, rgba(19, 34, 51, 0.95) 0%, rgba(13, 23, 34, 0.95) 100%)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Support Agents
            </span>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
              {data.summary.totalAgents}
            </h3>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              Registered specialists
            </span>
          </div>
        </div>

        {/* KPI 2: Total Assigned Tickets */}
        <div
          className="card-panel"
          style={{
            padding: "18px 20px",
            background: "linear-gradient(135deg, rgba(19, 34, 51, 0.95) 0%, rgba(13, 23, 34, 0.95) 100%)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "rgba(20, 184, 166, 0.15)",
              color: "var(--accent-teal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Assigned Tickets
            </span>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
              {data.summary.totalAssignedTeam}
            </h3>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              Distributed across team
            </span>
          </div>
        </div>

        {/* KPI 3: Team Resolution Rate */}
        <div
          className="card-panel"
          style={{
            padding: "18px 20px",
            background: "linear-gradient(135deg, rgba(19, 34, 51, 0.95) 0%, rgba(13, 23, 34, 0.95) 100%)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Resolution Rate
            </span>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", margin: "2px 0 0" }}>
              {data.summary.overallTeamResolutionRate}%
            </h3>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {data.summary.totalResolvedTeam} tickets resolved
            </span>
          </div>
        </div>

        {/* KPI 4: Customer Satisfaction Rating */}
        <div
          className="card-panel"
          style={{
            padding: "18px 20px",
            background: "linear-gradient(135deg, rgba(19, 34, 51, 0.95) 0%, rgba(13, 23, 34, 0.95) 100%)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "rgba(245, 158, 11, 0.15)",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Star size={24} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Customer Rating
            </span>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#f59e0b", margin: "2px 0 0" }}>
              {data.summary.teamAvgRating} <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ 5.0</span>
            </h3>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {data.summary.totalTeamReviews} verified reviews
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Control Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", minWidth: "280px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search agents by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ height: "42px", fontSize: "13px" }}
          />
        </div>

        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
          Showing {filteredAgents.length} team members
        </span>
      </div>

      {/* Error Notice */}
      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#ef4444",
            fontSize: "13px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="card-panel"
              style={{
                height: "90px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-card)",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div
          className="card-panel"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <Users size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
            No Support Agents Found
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {searchTerm ? "No agents matched your search criteria." : "No support agents have registered yet."}
          </p>
        </div>
      ) : (
        /* 4. Agents Performance Cards List */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredAgents.map((agent) => {
            const isExpanded = expandedAgentId === agent._id;
            const progressColor =
              agent.resolutionRate >= 80
                ? "#10b981"
                : agent.resolutionRate >= 50
                ? "#f59e0b"
                : "#ef4444";

            return (
              <div
                key={agent._id}
                className="card-panel"
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: isExpanded ? "1px solid var(--accent-teal)" : "1px solid var(--border-color)",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Main Card Header / Metrics Row */}
                <div
                  style={{
                    padding: "20px 24px",
                    display: "grid",
                    gridTemplateColumns: "minmax(220px, 2fr) repeat(auto-fit, minmax(130px, 1fr)) auto",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  {/* Agent Profile Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background:
                          agent.role === "admin"
                            ? "linear-gradient(135deg, #ef4444, #dc2626)"
                            : "linear-gradient(135deg, #f59e0b, #d97706)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "16px",
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h4
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {agent.name}
                        </h4>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "1px 6px",
                            borderRadius: "10px",
                            background:
                              agent.role === "admin" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            color: agent.role === "admin" ? "#f87171" : "#fbbf24",
                          }}
                        >
                          {agent.role}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          margin: "2px 0 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {agent.email}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Tickets */}
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                      Assigned Tickets
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                        {agent.totalAssigned}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>total</span>
                    </div>
                  </div>

                  {/* Resolved & In Progress */}
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                      Status Breakdown
                    </span>
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#10b981",
                        }}
                      >
                        ✓ {agent.completedCount} Resolved
                      </span>
                      {agent.inProgressCount > 0 && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#fbbf24",
                          }}
                        >
                          ⏳ {agent.inProgressCount} Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Resolution Rate */}
                  <div style={{ minWidth: "120px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                        Resolution Rate
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: progressColor }}>
                        {agent.resolutionRate}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        background: "var(--bg-input)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${agent.resolutionRate}%`,
                          height: "100%",
                          background: progressColor,
                          borderRadius: "3px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Customer Rating */}
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                      Customer Rating
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      {renderStars(agent.avgRating)}
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#f59e0b" }}>
                        {agent.avgRating > 0 ? agent.avgRating : "N/A"}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        ({agent.totalRatings})
                      </span>
                    </div>
                  </div>

                  {/* Expand Reviews Button */}
                  <div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleExpand(agent._id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        fontSize: "12px",
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>{isExpanded ? "Hide Feedback" : "Reviews"}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* 5. Expanded Customer Reviews Section */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "18px 24px 22px",
                      background: "rgba(0, 0, 0, 0.2)",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                      }}
                    >
                      <h5 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Customer Feedback & Reviews ({agent.customerReviews?.length || 0})
                      </h5>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Verified customer ratings submitted after ticket resolution
                      </span>
                    </div>

                    {!agent.customerReviews || agent.customerReviews.length === 0 ? (
                      <div
                        style={{
                          padding: "16px",
                          background: "var(--bg-input)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          textAlign: "center",
                        }}
                      >
                        No ratings or feedback received for this agent yet.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
                        {agent.customerReviews.map((rev, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "14px 16px",
                              background: "var(--bg-card)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-md)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                                  {rev.customerName}
                                </span>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>
                                  ({rev.customerEmail})
                                </span>
                              </div>
                              {renderStars(rev.rating)}
                            </div>

                            <p style={{ fontSize: "11.5px", color: "var(--accent-teal)", fontWeight: 600, margin: 0 }}>
                              Ticket: "{rev.ticketTitle}"
                            </p>

                            {rev.comment ? (
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-secondary)",
                                  margin: 0,
                                  fontStyle: "italic",
                                  lineHeight: "1.4",
                                }}
                              >
                                "{rev.comment}"
                              </p>
                            ) : (
                              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                                (Customer rated without a written comment)
                              </p>
                            )}

                            <span style={{ fontSize: "10px", color: "var(--text-muted)", alignSelf: "flex-end", marginTop: "auto" }}>
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgentPerformancePage;

