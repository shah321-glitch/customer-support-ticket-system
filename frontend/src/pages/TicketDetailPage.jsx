import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Paperclip, 
  ExternalLink, 
  Send, 
  User, 
  Headphones, 
  Crown, 
  Clock, 
  Calendar, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle,
  Shield,
  MessageSquare,
  Sparkles,
  Star
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const updated = await api.submitFeedback(id, rating, feedbackComment);
      setTicket(updated);
      showToast("Thank you for your rating & feedback! ⭐", "success");
    } catch (err) {
      showToast(err.message || "Failed to submit rating", "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const fetchTicketData = async () => {
    try {
      const ticketRes = await api.getTicketById(id);
      setTicket(ticketRes);

      if (user?.role === "agent" || user?.role === "admin") {
        try {
          const agentsRes = await api.getAgents();
          if (Array.isArray(agentsRes)) setAgents(agentsRes);
        } catch (_) {}
      }
    } catch (err) {
      showToast(err.message || "Failed to load ticket details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const updated = await api.addComment(id, replyMessage.trim());
      setTicket(updated);
      setReplyMessage("");
      showToast("Response sent successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to post comment", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateField = async (fields) => {
    setUpdatingStatus(true);
    try {
      const updated = await api.updateTicket(id, fields);
      setTicket(updated);
      showToast("Ticket updated successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to update ticket", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteTicket = async () => {
    setDeleting(true);
    try {
      await api.deleteTicket(id);
      showToast("Ticket deleted permanently", "success");
      navigate("/tickets");
    } catch (err) {
      showToast(err.message || "Failed to delete ticket", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  if (loading) {
    return (
      <div style={{ padding: "80px 0" }}>
        <LoadingSpinner text="Loading ticket details & conversation..." />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="card-panel" style={{ padding: "40px", textAlign: "center" }}>
        <AlertCircle size={40} color="#f87171" style={{ marginBottom: "12px" }} />
        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Ticket Not Found</h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
          The requested ticket does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate("/tickets")}
          className="btn btn-primary btn-sm"
          style={{ marginTop: "16px" }}
        >
          Return to Ticket Queue
        </button>
      </div>
    );
  }

  const isStaff = user?.role === "agent" || user?.role === "admin";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Breadcrumb Trail */}
      <div className="breadcrumb-trail">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <Link to="/tickets">Tickets</Link>
        <span>/</span>
        <span className="breadcrumb-active">#{id.slice(-6).toUpperCase()}</span>
      </div>

      {/* Ticket Header Banner */}
      <div
        className="card-panel"
        style={{
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
              #{ticket._id}
            </span>
            <button
              onClick={handleCopyId}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              title="Copy Ticket ID"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
            <span className={`badge ${getStatusClass(ticket.status)}`}>{ticket.status}</span>
            <span className={`badge ${getPriorityClass(ticket.priority)}`}>{ticket.priority}</span>
            <span className="badge badge-category">{ticket.category}</span>
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.4px" }}>
            {ticket.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
            <span>Created by <strong style={{ color: "var(--text-secondary)" }}>{ticket.createdBy?.name || "Customer"}</strong></span>
            <span>•</span>
            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/tickets")}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={14} />
            <span>Back to Queue</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Main Content (Left) + Management Panel (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Description + Attachment + Conversation Thread */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Issue Description Card */}
          <div className="card-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", color: "var(--text-secondary)" }}>
              ISSUE DESCRIPTION
            </h3>
            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
              {ticket.description}
            </p>

            {/* Attached File Preview */}
            {ticket.attachment?.url && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Paperclip size={16} color="var(--accent-teal)" />
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>
                      Attachment: {ticket.attachment.originalname || ticket.attachment.filename}
                    </span>
                  </div>
                  <a
                    href={`http://localhost:5000${ticket.attachment.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "11px", padding: "4px 10px" }}
                  >
                    <ExternalLink size={12} />
                    <span>View Full Size</span>
                  </a>
                </div>

                {ticket.attachment.mimetype?.startsWith("image/") ? (
                  <div style={{ marginTop: "10px", borderRadius: "8px", overflow: "hidden", maxHeight: "280px" }}>
                    <img
                      src={`http://localhost:5000${ticket.attachment.url}`}
                      alt="Attachment Preview"
                      style={{ maxWidth: "100%", maxHeight: "280px", objectFit: "contain", borderRadius: "8px", background: "#000" }}
                    />
                  </div>
                ) : (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Document file available for download via link above.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 5-Star Customer Resolution Feedback */}
          {(ticket.status === "Resolved" || ticket.status === "Closed") && (
            <div
              className="card-panel"
              style={{
                padding: "22px 24px",
                background: ticket.feedback?.rating
                  ? "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)",
                border: ticket.feedback?.rating ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(20, 184, 166, 0.4)",
              }}
            >
              {ticket.feedback?.rating ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        CUSTOMER RESOLUTION FEEDBACK
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {new Date(ticket.feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        color={star <= ticket.feedback.rating ? "#fbbf24" : "var(--border-color)"}
                        fill={star <= ticket.feedback.rating ? "#fbbf24" : "transparent"}
                      />
                    ))}
                    <span style={{ fontWeight: 800, fontSize: "15px", color: "#fbbf24", marginLeft: "6px" }}>
                      {ticket.feedback.rating} / 5 Stars
                    </span>
                  </div>

                  {ticket.feedback.comment && (
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic", margin: 0 }}>
                      "{ticket.feedback.comment}"
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={16} color="#fbbf24" />
                      Rate Your Resolution Experience
                    </h3>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Help us improve our service
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                    This ticket has been marked as {ticket.status}. Please leave a star rating on how well our support team assisted you.
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                            transition: "transform 0.15s ease",
                            transform: (hoverRating || rating) >= star ? "scale(1.2)" : "scale(1)",
                          }}
                        >
                          <Star
                            size={26}
                            color={isFilled ? "#fbbf24" : "var(--text-muted)"}
                            fill={isFilled ? "#fbbf24" : "transparent"}
                          />
                        </button>
                      );
                    })}
                    <span style={{ fontWeight: 800, fontSize: "14px", color: "#fbbf24", marginLeft: "10px" }}>
                      {rating} of 5 Stars
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Add an optional review or comment for the support team..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="form-input"
                      style={{ fontSize: "13px" }}
                    />
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="btn btn-primary btn-sm"
                      style={{ minWidth: "140px", height: "42px" }}
                    >
                      {submittingFeedback ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Conversation / Reply Thread */}
          <div className="card-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageSquare size={16} color="var(--accent-teal)" />
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                  Conversation Thread ({ticket.comments?.length || 0})
                </h3>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Audited SLA Timeline
              </span>
            </div>

            {/* Comments List */}
            <div className="chat-container" style={{ marginBottom: "24px" }}>
              {(!ticket.comments || ticket.comments.length === 0) ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: "13px" }}>
                  No replies yet. Be the first to start the conversation!
                </div>
              ) : (
                ticket.comments.map((comment, idx) => {
                  const isAgentComment = comment.senderRole === "agent" || comment.senderRole === "admin";
                  return (
                    <div
                      key={comment._id || idx}
                      className={`chat-bubble ${isAgentComment ? "chat-bubble-agent" : "chat-bubble-customer"}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isAgentComment ? (
                            <Headphones size={13} color="var(--accent-teal)" />
                          ) : (
                            <User size={13} color="var(--accent-cyan)" />
                          )}
                          <strong style={{ fontSize: "12.5px" }}>{comment.senderName}</strong>
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "1px 6px",
                              borderRadius: "10px",
                              background: isAgentComment ? "var(--primary-light)" : "rgba(255,255,255,0.08)",
                              color: isAgentComment ? "var(--accent-teal)" : "var(--text-muted)",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {comment.senderRole}
                          </span>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{comment.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Write a Reply Form */}
            <form onSubmit={handleSendReply} style={{ borderTop: "1px solid var(--border-color)", paddingTop: "18px" }}>
              <label className="form-label">Write a Response</label>
              <textarea
                rows={3}
                required
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response here... (Customer will be notified via email)"
                className="form-input"
                style={{ resize: "vertical", marginBottom: "12px" }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {isStaff && ticket.status === "Open" ? "💡 Replying will automatically transition ticket to 'In Progress'" : ""}
                </span>
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="btn btn-primary"
                  style={{ minWidth: "130px" }}
                >
                  <Send size={14} />
                  <span>{sendingReply ? "Sending..." : "Send Reply"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Ticket Control Panel & Audit Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Quick Actions Panel */}
          <div className="card-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>
              TICKET CONTROLS
            </h3>

            {/* Status Workflow Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Workflow Status</label>
              <select
                value={ticket.status}
                disabled={!isStaff && ticket.status !== "Open"}
                onChange={(e) => handleUpdateField({ status: e.target.value })}
                className="form-input"
                style={{ fontSize: "13px" }}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Priority</label>
              <select
                value={ticket.priority}
                disabled={!isStaff}
                onChange={(e) => handleUpdateField({ priority: e.target.value })}
                className="form-input"
                style={{ fontSize: "13px" }}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            {/* Agent Assignee (Agent / Admin only) */}
            {isStaff && (
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Assign Support Specialist</label>
                <select
                  value={ticket.assignedTo?._id || ""}
                  onChange={(e) => handleUpdateField({ assignedTo: e.target.value || null })}
                  className="form-input"
                  style={{ fontSize: "13px" }}
                >
                  <option value="">-- Unassigned --</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Ticket Information Audit Card */}
          <div className="card-panel" style={{ padding: "20px", fontSize: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px", color: "var(--text-secondary)" }}>
              TICKET METADATA
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Submitted By:</span>
                <p style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {ticket.createdBy?.name || "Customer"} ({ticket.createdBy?.email || "N/A"})
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Assigned To:</span>
                <p style={{ fontWeight: 600, color: "var(--accent-teal)", marginTop: "2px" }}>
                  {ticket.assignedTo?.name || "Unassigned"}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Created Date:</span>
                <p style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Last Updated:</span>
                <p style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                  {new Date(ticket.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Only: Danger Zone */}
          {user?.role === "admin" && (
            <div
              className="card-panel"
              style={{
                padding: "18px",
                borderColor: "rgba(239, 68, 68, 0.3)",
                background: "rgba(239, 68, 68, 0.05)",
              }}
            >
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#f87171", marginBottom: "8px" }}>
                ADMINISTRATOR ZONE
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
                Deleting this ticket will permanently remove all associated conversation logs and attachments.
              </p>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowDeleteModal(true)}
                style={{ width: "100%" }}
              >
                <Trash2 size={13} />
                <span>Delete Ticket</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Delete Ticket #{ticket._id.slice(-6)}?</h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
              Are you sure you want to permanently delete <strong>"{ticket.title}"</strong>? This action cannot be reversed.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteTicket}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;

