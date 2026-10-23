import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Trash2, 
  ExternalLink, 
  Paperclip, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  X,
  AlertCircle,
  Inbox,
  Download,
  Star,
  RotateCcw
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const TicketListPage = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "All");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "All");
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get("priority") || "All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Data state
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const [ticketData, statsData] = await Promise.all([
        api.getTickets(
          {
            status: statusFilter,
            category: categoryFilter,
            priority: priorityFilter,
            search: searchQuery,
          },
          page,
          10
        ),
        api.getStats().catch(() => null),
      ]);

      if (ticketData && ticketData.tickets) {
        setTickets(ticketData.tickets);
        setPagination(ticketData.pagination || { page, limit: 10, total: ticketData.tickets.length, totalPages: 1 });
      } else if (Array.isArray(ticketData)) {
        setTickets(ticketData);
      }

      if (statsData) setStats(statsData);
    } catch (err) {
      showToast(err.message || "Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  // Sync searchParams from URL
  useEffect(() => {
    const qStatus = searchParams.get("status");
    const qCategory = searchParams.get("category");
    const qPriority = searchParams.get("priority");
    const qSearch = searchParams.get("search");
    const qPage = searchParams.get("page");

    if (qStatus && qStatus !== statusFilter) setStatusFilter(qStatus);
    if (qCategory && qCategory !== categoryFilter) setCategoryFilter(qCategory);
    if (qPriority && qPriority !== priorityFilter) setPriorityFilter(qPriority);
    if (qSearch !== null && qSearch !== searchQuery) setSearchQuery(qSearch);
    if (qPage && Number(qPage) !== page) setPage(Number(qPage));
  }, [searchParams]);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter, page]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleClearFilters = () => {
    setStatusFilter("All");
    setCategoryFilter("All");
    setPriorityFilter("All");
    setSearchQuery("");
    setPage(1);
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setDeleting(true);
    try {
      await api.deleteTicket(ticketToDelete._id);
      showToast("Ticket deleted successfully", "success");
      setTicketToDelete(null);
      fetchTickets();
    } catch (err) {
      showToast(err.message || "Failed to delete ticket", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (!tickets || tickets.length === 0) {
      showToast("No tickets available to export", "info");
      return;
    }

    const headers = [
      "Ticket ID",
      "Title",
      "Category",
      "Priority",
      "Status",
      "Customer Name",
      "Customer Email",
      "Assigned Agent",
      "Comments Count",
      "Customer Rating",
      "Created At",
      "Updated At",
    ];

    const rows = tickets.map((t) => [
      `"${t._id}"`,
      `"${(t.title || "").replace(/"/g, '""')}"`,
      `"${t.category || ""}"`,
      `"${t.priority || ""}"`,
      `"${t.status || ""}"`,
      `"${(t.createdBy?.name || "Customer").replace(/"/g, '""')}"`,
      `"${t.createdBy?.email || ""}"`,
      `"${(t.assignedTo?.name || "Unassigned").replace(/"/g, '""')}"`,
      t.comments?.length || 0,
      t.feedback?.rating ? `${t.feedback.rating}/5` : "Unrated",
      `"${new Date(t.createdAt).toLocaleString()}"`,
      `"${new Date(t.updatedAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ResolveDesk_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${tickets.length} tickets to CSV successfully! 📥`, "success");
  };

  const statusTabs = [
    { id: "All", label: "All Tickets", count: stats?.total || tickets.length },
    { id: "Open", label: "Open", count: stats?.open || 0 },
    { id: "In Progress", label: "In Progress", count: stats?.inProgress || 0 },
    { id: "Resolved", label: "Resolved", count: stats?.resolved || 0 },
    { id: "Closed", label: "Closed", count: stats?.closed || 0 },
  ];

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High": return "priority-high";
      case "Medium": return "priority-medium";
      default: return "priority-low";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Open": return "badge-open";
      case "In Progress": return "badge-progress";
      case "Resolved": return "badge-resolved";
      default: return "badge-closed";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* 1. Status Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                background: isActive ? "var(--bg-card)" : "transparent",
                border: "none",
                borderBottom: isActive ? "3px solid var(--accent-teal)" : "3px solid transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 7px",
                  borderRadius: "10px",
                  background: isActive ? "var(--primary-light)" : "var(--bg-input)",
                  color: isActive ? "var(--accent-teal)" : "var(--text-muted)",
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Filter Toolbar */}
      <div
        className="card-panel"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ position: "relative", minWidth: "240px", flex: "1 1 240px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by title, ID or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
            />
          </form>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="form-input"
            style={{ width: "auto", minWidth: "150px", height: "38px", fontSize: "13px" }}
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Billing">Billing</option>
            <option value="Account">Account</option>
            <option value="General">General</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="form-input"
            style={{ width: "auto", minWidth: "140px", height: "38px", fontSize: "13px" }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {(statusFilter !== "All" || categoryFilter !== "All" || priorityFilter !== "All" || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary btn-sm"
              style={{ height: "38px", gap: "4px" }}
              title="Clear all filters"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Action: Export & Create Ticket */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ height: "38px", padding: "0 14px", fontSize: "13px" }}
            title="Download CSV Spreadsheet Report"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {user?.role === "customer" && (
            <button
              onClick={() => navigate("/tickets/new")}
              className="btn btn-primary"
              style={{ height: "38px", padding: "0 16px" }}
            >
              <PlusCircle size={15} />
              <span>New Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Ticket Table */}
      <div className="card-panel" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px 0" }}>
            <LoadingSpinner text="Fetching support tickets..." />
          </div>
        ) : tickets.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Inbox size={42} color="var(--text-muted)" />
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>No tickets found matching your criteria</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "380px" }}>
              Try adjusting your search terms, status filters, or create a brand new ticket.
            </p>
            {user?.role === "customer" ? (
              <button
                onClick={() => navigate("/tickets/new")}
                className="btn btn-primary btn-sm"
                style={{ marginTop: "10px" }}
              >
                <PlusCircle size={14} />
                <span>Submit a Ticket</span>
              </button>
            ) : (
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "10px" }}
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="saas-table-container" style={{ border: "none", borderRadius: 0 }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Ticket Details</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Owner / Submitter</th>
                  <th>Assigned Agent</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
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
                          <span title="Attachment included">
                            <Paperclip size={13} color="var(--accent-teal)" />
                          </span>
                        )}
                        {t.comments?.length > 0 && (
                          <span
                            title={`${t.comments.length} replies`}
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
                        {t.feedback?.rating && (
                          <span
                            title={`Customer Rating: ${t.feedback.rating}/5 Stars`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px",
                              fontSize: "11px",
                              color: "#fbbf24",
                              fontWeight: 700,
                              background: "rgba(245, 158, 11, 0.12)",
                              padding: "1px 6px",
                              borderRadius: "10px",
                            }}
                          >
                            <Star size={11} fill="#fbbf24" color="#fbbf24" />
                            {t.feedback.rating}
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
                      {t.assignedTo ? (
                        <span style={{ fontSize: "12px", color: "var(--accent-teal)", fontWeight: 600 }}>
                          {t.assignedTo.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/tickets/${t._id}`)}
                          title="View Details"
                        >
                          <ExternalLink size={13} />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setTicketToDelete(t)}
                            title="Delete Ticket (Admin)"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-input)",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total tickets)
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Admin) */}
      {ticketToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
        >
          <div className="auth-card" style={{ maxWidth: "420px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <AlertCircle size={22} color="#f87171" />
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Confirm Deletion</h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
              Are you sure you want to delete ticket{" "}
              <strong>"{ticketToDelete.title}"</strong>? This action is permanent and cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setTicketToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteTicket}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketListPage;

