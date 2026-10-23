import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Info,
  TrendingUp,
  ShieldCheck 
} from "lucide-react";

const MetricCards = ({ stats = {} }) => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const total = stats.total || 0;
  const open = stats.open || 0;
  const inProgress = stats.inProgress || 0;
  const resolved = stats.resolved || 0;
  const closed = stats.closed || 0;
  const totalResolved = resolved + closed;
  const resolutionRate = total > 0 ? Math.round((totalResolved / total) * 100) : 0;

  const cards = [
    {
      id: "total",
      title: "Total Tickets",
      value: total.toLocaleString(),
      subtext: "All customer submissions",
      icon: Users,
      cardClass: "metric-card-teal",
      tooltipTitle: "System Volume Telemetry",
      tooltipDesc: "Aggregated ticket count across all departments and priority tiers.",
      targetRoute: "/tickets?status=All",
    },
    {
      id: "resolution",
      title: "Resolution Rate",
      value: `${resolutionRate}%`,
      subtext: `${totalResolved} Tickets resolved / closed`,
      icon: CheckCircle2,
      cardClass: "metric-card-emerald",
      tooltipTitle: "Quality & SLA Benchmark",
      tooltipDesc: `Calculated as (${resolved} resolved + ${closed} closed) / ${total} total tickets. Target benchmark is > 80%.`,
      targetRoute: "/tickets?status=Resolved",
    },
    {
      id: "inProgress",
      title: "In Progress",
      value: inProgress.toLocaleString(),
      subtext: "Active agent triage",
      icon: Clock,
      cardClass: "metric-card-cyan",
      tooltipTitle: "Active Workload",
      tooltipDesc: "Tickets currently assigned to staff and undergoing active troubleshooting.",
      targetRoute: "/tickets?status=In Progress",
    },
    {
      id: "open",
      title: "Open Issues",
      value: open.toLocaleString(),
      subtext: "Awaiting first response",
      icon: AlertTriangle,
      cardClass: "metric-card-indigo",
      tooltipTitle: "Response Queue Urgency",
      tooltipDesc: "Newly raised tickets pending agent review and initial triage response.",
      targetRoute: "/tickets?status=Open",
    },
  ];

  return (
    <div
      className="stat-cards-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "18px",
        marginBottom: "28px",
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isHovered = hoveredCard === card.id;

        return (
          <div
            key={card.id}
            className={card.cardClass}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(card.targetRoute)}
            style={{
              cursor: "pointer",
              position: "relative",
              transform: isHovered ? "translateY(-4px)" : "translateY(0)",
              boxShadow: isHovered ? "0 18px 35px rgba(0,0,0,0.4)" : undefined,
              transition: "all 0.22s ease",
            }}
          >
            {/* SVG Decorative Wave */}
            <svg className="metric-wave-bg" width="160" height="100" viewBox="0 0 160 100" fill="none">
              <path d="M0 80 Q40 20 80 50 T160 30 V100 H0 Z" fill="#ffffff" />
            </svg>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", opacity: 0.9 }}>
                    {card.title}
                  </span>
                  <Info size={13} style={{ opacity: 0.8 }} />
                </div>

                <div style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1.1, marginTop: "6px" }}>
                  {card.value}
                </div>

                <span style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px", display: "block" }}>
                  {card.subtext}
                </span>
              </div>

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: isHovered ? "scale(1.1) rotate(6deg)" : "scale(1)",
                  transition: "all 0.25s ease",
                }}
              >
                <Icon size={22} color="#fff" />
              </div>
            </div>

            {/* Interactive Hover Popup Tooltip */}
            {isHovered && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-62px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  zIndex: 50,
                  width: "90%",
                  textAlign: "center",
                  animation: "fadeIn 0.15s ease-out",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent-teal)", marginBottom: "2px" }}>
                  {card.tooltipTitle}
                </div>
                <div style={{ fontSize: "10.5px", color: "var(--text-secondary)", lineHeight: "1.3" }}>
                  {card.tooltipDesc}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
