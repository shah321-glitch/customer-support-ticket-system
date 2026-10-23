import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  PieChart, 
  Activity, 
  Info, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Layers
} from "lucide-react";

const CATEGORY_COLORS = [
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ec4899", // Pink
];

const STATUS_DETAILS = {
  Open: {
    desc: "Awaiting initial agent assignment & triage response",
    sla: "Target SLA: Initial response within 1 hour",
    action: "Needs review by support triage",
  },
  "In Progress": {
    desc: "Active investigation underway with assigned specialist",
    sla: "Target SLA: Regular hourly updates",
    action: "Troubleshooting & resolution in progress",
  },
  Resolved: {
    desc: "Solution delivered to customer; awaiting confirmation",
    sla: "Target SLA: Completed within standard SLA",
    action: "Verified fix deployed",
  },
  Closed: {
    desc: "Permanently resolved and verified by customer/admin",
    sla: "Final audit complete",
    action: "Archived ticket history",
  },
};

const PRIORITY_DETAILS = {
  High: {
    sla: "< 2 Hours Response",
    color: "#ef4444",
    impact: "Critical Service Interruption",
  },
  Medium: {
    sla: "< 12 Hours Response",
    color: "#f59e0b",
    impact: "Degraded Functionality",
  },
  Low: {
    sla: "< 24 Hours Response",
    color: "#10b981",
    impact: "General Inquiry / Minor Issue",
  },
};

const DashboardCharts = ({ stats }) => {
  const navigate = useNavigate();
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [hoveredPriority, setHoveredPriority] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [chartView, setChartView] = useState("status"); // "status" | "priority"

  if (!stats) return null;

  const total = stats.total || 0;
  const statusData = [
    { label: "Open", count: stats.open || 0, color: "#06b6d4" },
    { label: "In Progress", count: stats.inProgress || 0, color: "#f59e0b" },
    { label: "Resolved", count: stats.resolved || 0, color: "#10b981" },
    { label: "Closed", count: stats.closed || 0, color: "#64748b" },
  ];

  const priorityData = stats.byPriority && stats.byPriority.length > 0 
    ? stats.byPriority 
    : [
        { _id: "High", count: 0 },
        { _id: "Medium", count: 0 },
        { _id: "Low", count: 0 },
      ];

  const categoryData = stats.byCategory || stats.categoryBreakdown || [];
  const totalCategory = categoryData.reduce((sum, c) => sum + c.count, 0) || 1;

  // Max value for scale calculation
  const maxStatusCount = Math.max(...statusData.map((s) => s.count), 1);

  // Calculate SVG Pie/Donut slices
  let cumulativeAngle = 0;
  const donutSlices = categoryData.map((cat, i) => {
    const fraction = cat.count / totalCategory;
    const startAngle = cumulativeAngle;
    const angle = fraction * 360;
    cumulativeAngle += angle;
    const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
    return {
      name: cat._id || `Category ${i + 1}`,
      count: cat.count,
      percentage: Math.round(fraction * 100),
      color,
      startAngle,
      angle,
    };
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "22px", marginBottom: "28px" }}>
      {/* 1. Main Interactive Bar / Pillar Chart */}
      <div className="card-panel" style={{ padding: "26px", position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="var(--accent-teal)" />
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>
                Ticket Volume & Workflow Activity
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
              Hover over any bar for deep metrics, SLA impact, and filter shortcuts
            </p>
          </div>

          {/* Toggle View */}
          <div style={{ display: "flex", gap: "4px", background: "var(--bg-input)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
            <button
              onClick={() => setChartView("status")}
              style={{
                background: chartView === "status" ? "var(--primary)" : "transparent",
                color: chartView === "status" ? "#fff" : "var(--text-secondary)",
                border: "none",
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              By Status
            </button>
            <button
              onClick={() => setChartView("priority")}
              style={{
                background: chartView === "priority" ? "var(--primary)" : "transparent",
                color: chartView === "priority" ? "#fff" : "var(--text-secondary)",
                border: "none",
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              By Priority
            </button>
          </div>
        </div>

        {/* Chart Canvas Area */}
        {chartView === "status" ? (
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                height: "200px",
                paddingTop: "30px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "10px",
              }}
            >
              {statusData.map((item) => {
                const heightPct = Math.max((item.count / maxStatusCount) * 100, 16);
                const isHovered = hoveredStatus?.label === item.label;
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHoveredStatus({ ...item, percentage, ...STATUS_DETAILS[item.label] })}
                    onMouseLeave={() => setHoveredStatus(null)}
                    onClick={() => navigate(`/tickets?status=${encodeURIComponent(item.label)}`)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      position: "relative",
                      zIndex: isHovered ? 20 : 1,
                    }}
                  >
                    {/* Count Number on Top of Bar */}
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: isHovered ? "#fff" : item.color,
                        transform: isHovered ? "scale(1.15)" : "scale(1)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.count}
                    </span>

                    {/* Pillar Bar with Gradient & Glow */}
                    <div
                      style={{
                        width: "52px",
                        height: `${heightPct}%`,
                        background: isHovered
                          ? `linear-gradient(180deg, ${item.color} 0%, rgba(20, 184, 166, 0.4) 100%)`
                          : `linear-gradient(180deg, ${item.color} 0%, rgba(20, 184, 166, 0.15) 100%)`,
                        borderRadius: "10px 10px 4px 4px",
                        boxShadow: isHovered
                          ? `0 0 22px ${item.color}, 0 4px 12px rgba(0,0,0,0.4)`
                          : "none",
                        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                        transition: "all 0.2s ease",
                        border: isHovered ? `1px solid ${item.color}` : "1px solid transparent",
                      }}
                    />

                    {/* Bottom Label */}
                    <span
                      style={{
                        fontSize: "12px",
                        color: isHovered ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: isHovered ? 800 : 600,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Rich Interactive Floating Popup for Status Bar */}
            {hoveredStatus && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--bg-card)",
                  border: `1px solid ${hoveredStatus.color}`,
                  borderRadius: "var(--radius-md)",
                  padding: "14px 18px",
                  boxShadow: `0 12px 35px rgba(0, 0, 0, 0.6), 0 0 15px ${hoveredStatus.color}40`,
                  zIndex: 30,
                  pointerEvents: "none",
                  minWidth: "280px",
                  backdropFilter: "blur(12px)",
                  animation: "fadeIn 0.18s ease-out",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: hoveredStatus.color }} />
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{hoveredStatus.label} Phase</strong>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: hoveredStatus.color }}>
                    {hoveredStatus.percentage}% of Total
                  </span>
                </div>

                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {hoveredStatus.count} Active Tickets
                </div>

                <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4", marginBottom: "8px" }}>
                  {hoveredStatus.desc}
                </p>

                <div style={{ fontSize: "11px", color: "var(--accent-teal)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  <span>{hoveredStatus.sla}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Priority Breakdown Bars */
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "200px", justifyContent: "center", position: "relative" }}>
            {priorityData.map((p) => {
              const count = p.count || 0;
              const maxP = Math.max(...priorityData.map((item) => item.count || 0), 1);
              const pct = Math.max((count / maxP) * 100, 10);
              const info = PRIORITY_DETAILS[p._id] || { sla: "< 24 Hours", color: "var(--accent-teal)", impact: "Standard" };
              const isHovered = hoveredPriority?._id === p._id;
              const totalTickets = total || 1;
              const sharePct = Math.round((count / totalTickets) * 100);

              return (
                <div
                  key={p._id}
                  onMouseEnter={() => setHoveredPriority({ ...p, sharePct, ...info })}
                  onMouseLeave={() => setHoveredPriority(null)}
                  onClick={() => navigate(`/tickets?priority=${encodeURIComponent(p._id)}`)}
                  style={{
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: isHovered ? "var(--bg-card-hover)" : "transparent",
                    transition: "all 0.18s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: info.color }} />
                      <strong style={{ color: "var(--text-primary)" }}>{p._id} Priority</strong>
                    </div>
                    <span style={{ fontWeight: 800, color: info.color }}>
                      {count} tickets ({sharePct}%)
                    </span>
                  </div>

                  <div style={{ width: "100%", height: "12px", background: "var(--bg-input)", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${info.color} 0%, rgba(20, 184, 166, 0.4) 100%)`,
                        borderRadius: "8px",
                        boxShadow: isHovered ? `0 0 12px ${info.color}` : "none",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Rich Hover Popup for Priority */}
            {hoveredPriority && (
              <div
                style={{
                  position: "absolute",
                  top: "-15px",
                  right: "10px",
                  background: "var(--bg-card)",
                  border: `1px solid ${hoveredPriority.color}`,
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  boxShadow: `0 12px 30px rgba(0, 0, 0, 0.6), 0 0 14px ${hoveredPriority.color}40`,
                  zIndex: 30,
                  pointerEvents: "none",
                  minWidth: "240px",
                  animation: "fadeIn 0.18s ease-out",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "13px", color: hoveredPriority.color }}>{hoveredPriority._id} Severity</strong>
                  <span style={{ fontSize: "11px", fontWeight: 700 }}>{hoveredPriority.sharePct}% workload</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
                  {hoveredPriority.impact}
                </p>
                <div style={{ fontSize: "11px", color: "var(--accent-teal)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  <span>Target SLA: {hoveredPriority.sla}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Category Radial Donut System with Slices & Legend Popups */}
      <div className="card-panel" style={{ padding: "26px", position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <PieChart size={18} color="var(--accent-teal)" />
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>
                Category Distribution System
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
              Hover over donut slices or legend pills for categorical telemetry
            </p>
          </div>
        </div>

        {/* Donut and Legend Flex Container */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap", justifyContent: "center" }}>
          {/* Radial Circular Donut */}
          <div
            style={{
              position: "relative",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: donutSlices.length > 0
                ? `conic-gradient(${donutSlices.map(s => `${s.color} ${s.startAngle}deg ${s.startAngle + s.angle}deg`).join(", ")})`
                : "conic-gradient(var(--border-color) 0deg 360deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
              transition: "transform 0.3s ease",
            }}
          >
            {/* Center Donut Hole */}
            <div
              style={{
                width: "98px",
                height: "98px",
                borderRadius: "50%",
                background: "var(--bg-card)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: hoveredCategory ? hoveredCategory.color : "var(--text-primary)",
                  transition: "all 0.2s ease",
                }}
              >
                {hoveredCategory ? hoveredCategory.count : totalCategory}
              </span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 800, letterSpacing: "0.5px" }}>
                {hoveredCategory ? hoveredCategory.name.toUpperCase() : "TOTAL"}
              </span>
            </div>
          </div>

          {/* Categorical Legend with Interactive Hover Popups */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "180px", flex: 1 }}>
            {categoryData.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No categories logged yet</p>
            ) : (
              donutSlices.map((slice) => {
                const isHovered = hoveredCategory?.name === slice.name;
                return (
                  <div
                    key={slice.name}
                    onMouseEnter={() => setHoveredCategory(slice)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => navigate(`/tickets?category=${encodeURIComponent(slice.name)}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      background: isHovered ? "var(--bg-input)" : "transparent",
                      border: isHovered ? `1px solid ${slice.color}` : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "3px",
                          background: slice.color,
                          boxShadow: isHovered ? `0 0 8px ${slice.color}` : "none",
                        }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: isHovered ? 800 : 600, color: "var(--text-primary)" }}>
                        {slice.name}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {slice.percentage}%
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: slice.color,
                          background: isHovered ? "rgba(255,255,255,0.08)" : "transparent",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {slice.count}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Detailed Hover Popup */}
        {hoveredCategory && (
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "24px",
              background: "var(--bg-card)",
              border: `1px solid ${hoveredCategory.color}`,
              borderRadius: "var(--radius-md)",
              padding: "12px 18px",
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.7), 0 0 16px ${hoveredCategory.color}40`,
              zIndex: 35,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              backdropFilter: "blur(12px)",
              animation: "fadeIn 0.18s ease-out",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: hoveredCategory.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: "14px",
              }}
            >
              {hoveredCategory.percentage}%
            </div>
            <div>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)", display: "block" }}>
                {hoveredCategory.name} Category
              </strong>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {hoveredCategory.count} tickets • Click to filter queue
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
