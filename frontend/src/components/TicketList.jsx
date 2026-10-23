import React, { useState } from "react";
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Trash2, 
  Tag, 
  User, 
  Calendar,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Filter,
  ArrowUpDown,
  Paperclip
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import MetricCards from "./MetricCards";

const TicketList = ({ 
  tickets = [], 
  user, 
  stats,
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  onSelectTicket, 
  onDeleteTicket, 
  onOpenCreateTicket 
}) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // KPI calculations
  const total = stats ? stats.total : tickets.length;
  const openCount = stats ? stats.open : tickets.filter((t) => t.status === "Open").length;
  const progressCount = stats ? stats.inProgress : tickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = stats ? (stats.resolved + (stats.closed || 0)) : tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  // Priority rank for sorting
  const priorityRank = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

  // Filter & Search Logic
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchStatus = statusFilter === "All" || ticket.status === statusFilter;
      const matchPriority = priorityFilter === "All" || ticket.priority === priorityFilter;
      const matchCategory = categoryFilter === "All" || ticket.category === categoryFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.category.toLowerCase().includes(query) ||
        (ticket.createdBy?.name && ticket.createdBy.name.toLowerCase().includes(query));

      return matchStatus && matchPriority && matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "priority") return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
      return 0;
    });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Urgent":
        return <span className="badge priority-urgent">● Urgent</span>;
      case "High":
        return <span className="badge priority-high">● High</span>;
      case "Medium":
        return <span className="badge priority-medium">● Medium</span>;
      default:
        return <span className="badge priority-low">● Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return <span className="badge badge-open">Open</span>;
      case "In Progress":
        return <span className="badge badge-progress">In Progress</span>;
      case "Resolved":
        return <span className="badge badge-resolved">Resolved</span>;
      default:
        return <span className="badge badge-closed">Closed</span>;
    }
  };

  return (
    <div>
      {/* 1. KPI Analytics Summary (Gradient Wave Cards) */}
      <MetricCards stats={stats || { total, open: openCount, inProgress: progressCount, resolved: resolvedCount }} />

      {/* 2. Search & Controls Bar */}
      <div
        className="card-panel"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Top line: Search and Action */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by title, description, category, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "38px" }}
            />
          </div>

          <button className="btn btn-primary" onClick={onOpenCreateTicket}>
            + Raise Ticket
          </button>
        </div>

        {/* Bottom line: Filters & Sort */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "12px",
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { label: "All", count: total },
              { label: "Open", count: openCount },
              { label: "In Progress", count: progressCount },
              { label: "Resolved", count: resolvedCount },
              { label: "Closed", count: tickets.filter((t) => t.status === "Closed").length },
            ].map(({ label, count }) => (
              <button
                key={label}
                onClick={() => setStatusFilter(label)}
                style={{
                  background: statusFilter === label ? "var(--primary-light)" : "transparent",
                  color: statusFilter === label ? "#fff" : "var(--text-secondary)",
                  border: "1px solid",
                  borderColor: statusFilter === label ? "var(--primary)" : "transparent",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{label}</span>
                <span
                  style={{
                    fontSize: "11px",
                    background: statusFilter === label ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                    color: "#fff",
                    padding: "0 6px",
                    borderRadius: "10px",
                  }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Secondary Dropdowns */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Account">Account</option>
              <option value="Feature Request">Feature Request</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Ticket Cards Feed */}
      {loading ? (
        <div className="card-panel" style={{ padding: "48px 20px" }}>
          <LoadingSpinner text="Fetching tickets..." />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div
          className="card-panel"
          style={{
            textAlign: "center",
            padding: "64px 20px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(79, 70, 229, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--primary)",
            }}
          >
            <Inbox size={28} />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>No Tickets Found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
            {searchQuery
              ? "No tickets match your search criteria. Try a different keyword."
              : "There are currently no tickets in this view."}
          </p>
          <button className="btn btn-primary" onClick={onOpenCreateTicket}>
            Create a Ticket
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredTickets.map((ticket) => {
            const isOwner = user && ticket.createdBy && ticket.createdBy._id === user._id;
            const canDelete = user && (user.role === "admin" || (isOwner && ticket.status === "Open"));
            const commentCount = ticket.comments?.length || 0;

            return (
              <div
                key={ticket._id}
                onClick={() => onSelectTicket(ticket)}
                className="card-panel card-panel-hover"
                style={{
                  padding: "18px 20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Row 1: Badges & ID */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)", fontWeight: 700 }}>
                      #{ticket._id.slice(-6).toUpperCase()}
                    </span>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    <span className="badge badge-category">
                      <Tag size={11} />
                      {ticket.category}
                    </span>
                    {ticket.attachment && (
                      <span className="badge" style={{ background: "rgba(20, 184, 166, 0.15)", color: "var(--accent-teal)", border: "1px solid rgba(20, 184, 166, 0.3)" }}>
                        <Paperclip size={11} />
                        Image
                      </span>
                    )}
                  </div>

                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTicket(ticket._id);
                      }}
                      className="btn btn-danger btn-sm"
                      style={{ padding: "4px 8px" }}
                      title="Delete Ticket"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Row 2: Title & snippet */}
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                    {ticket.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.5",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {ticket.description}
                  </p>
                </div>

                {/* Row 3: Meta & Discussion count */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    paddingTop: "10px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <User size={13} />
                      <span>{ticket.createdBy?.name || "Customer"}</span>
                    </div>

                    {ticket.assignedTo && (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#fbbf24" }}>
                        <ShieldCheck size={13} />
                        <span>Agent: {ticket.assignedTo.name}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* Comments Badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: commentCount > 0 ? "var(--primary)" : "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>{commentCount} {commentCount === 1 ? "reply" : "replies"}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Calendar size={13} />
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            padding: "16px 20px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tickets
          </span>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
            >
              Previous
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className="btn btn-sm"
                onClick={() => onPageChange && onPageChange(p)}
                style={{
                  minWidth: "34px",
                  background: pagination.page === p ? "var(--primary)" : "transparent",
                  color: pagination.page === p ? "#fff" : "var(--text-secondary)",
                  border: "1px solid",
                  borderColor: pagination.page === p ? "var(--primary)" : "var(--border-color)",
                }}
              >
                {p}
              </button>
            ))}

            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
