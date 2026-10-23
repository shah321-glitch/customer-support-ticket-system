import React, { useState, useEffect } from "react";
import { 
  X, 
  Send, 
  User, 
  Clock, 
  Tag, 
  Shield, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  UserCheck,
  Paperclip
} from "lucide-react";
import { api, BACKEND_URL } from "../api";

const TicketDetailModal = ({ ticket, user, onClose, onTicketUpdated, agents = [], showToast }) => {
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setCurrentTicket(ticket);
  }, [ticket]);

  if (!currentTicket) return null;

  const isCustomer = user?.role === "customer";
  const isAgentOrAdmin = user?.role === "agent" || user?.role === "admin";
  const comments = currentTicket.comments || [];

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const updated = await api.addComment(currentTicket._id, replyText);
      setCurrentTicket(updated);
      onTicketUpdated(updated);
      setReplyText("");
      showToast("Reply posted successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to post reply", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await api.updateTicket(currentTicket._id, { status: newStatus });
      setCurrentTicket(updated);
      onTicketUpdated(updated);
      showToast(`Ticket status updated to ${newStatus}`, "success");
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignAgent = async (agentId) => {
    try {
      const updated = await api.updateTicket(currentTicket._id, { assignedTo: agentId || null });
      setCurrentTicket(updated);
      onTicketUpdated(updated);
      showToast("Ticket assignee updated", "success");
    } catch (err) {
      showToast(err.message || "Failed to assign agent", "error");
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const updated = await api.updateTicket(currentTicket._id, { priority: newPriority });
      setCurrentTicket(updated);
      onTicketUpdated(updated);
      showToast(`Priority changed to ${newPriority}`, "success");
    } catch (err) {
      showToast(err.message || "Failed to update priority", "error");
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Urgent": return "priority-urgent";
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="card-panel"
        style={{
          width: "100%",
          maxWidth: "850px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            background: "var(--bg-card)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                #{currentTicket._id.slice(-6).toUpperCase()}
              </span>
              <span className={`badge ${getStatusClass(currentTicket.status)}`}>
                {currentTicket.status}
              </span>
              <span className={`badge ${getPriorityClass(currentTicket.priority)}`}>
                {currentTicket.priority} Priority
              </span>
              <span className="badge badge-category">
                <Tag size={12} />
                {currentTicket.category}
              </span>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.3 }}>
              {currentTicket.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Agent Management Toolbar (Visible to Agents and Admins) */}
        {isAgentOrAdmin && (
          <div
            style={{
              padding: "12px 24px",
              background: "#101624",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Quick Status Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>STATUS:</span>
              {["Open", "In Progress", "Resolved", "Closed"].map((s) => (
                <button
                  key={s}
                  disabled={updatingStatus || currentTicket.status === s}
                  onClick={() => handleStatusChange(s)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: currentTicket.status === s ? "default" : "pointer",
                    border: "1px solid",
                    borderColor: currentTicket.status === s ? "var(--primary)" : "var(--border-color)",
                    background: currentTicket.status === s ? "var(--primary-light)" : "transparent",
                    color: currentTicket.status === s ? "#fff" : "var(--text-secondary)",
                    opacity: currentTicket.status === s ? 1 : 0.8,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Assignee & Priority Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Assign Agent Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <UserCheck size={14} color="var(--text-muted)" />
                <select
                  value={currentTicket.assignedTo?._id || ""}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                  style={{
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Dropdown */}
              <select
                value={currentTicket.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                style={{
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
        )}

        {/* 3. Conversation Thread & Details Scrollable Area */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Initial Ticket Description Card */}
          <div
            style={{
              background: "#121929",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: "12px",
                  }}
                >
                  {currentTicket.createdBy?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <strong style={{ color: "#fff" }}>{currentTicket.createdBy?.name || "Customer"}</strong>
                  <span style={{ marginLeft: "8px", fontSize: "11px", color: "#60a5fa" }}>[Creator]</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Clock size={13} />
                <span>{new Date(currentTicket.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <p style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
              {currentTicket.description}
            </p>

            {currentTicket.attachment && currentTicket.attachment.url && (
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Paperclip size={13} />
                  ATTACHED SCREENSHOT:
                </span>
                <a
                  href={`${BACKEND_URL}${currentTicket.attachment.url}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-block", textDecoration: "none" }}
                >
                  <img
                    src={`${BACKEND_URL}${currentTicket.attachment.url}`}
                    alt={currentTicket.attachment.originalname || "Attachment"}
                    style={{
                      maxHeight: "220px",
                      maxWidth: "100%",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      objectFit: "contain",
                      background: "rgba(0,0,0,0.2)",
                      display: "block",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--primary)", marginTop: "4px", display: "block" }}>
                    📎 {currentTicket.attachment.originalname} ({((currentTicket.attachment.size || 0) / 1024).toFixed(1)} KB) — Click to view full image
                  </span>
                </a>
              </div>
            )}

            {currentTicket.assignedTo && (
              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border-color)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Shield size={13} color="#fbbf24" />
                <span>Assigned to: <strong style={{ color: "#fff" }}>{currentTicket.assignedTo.name}</strong></span>
              </div>
            )}
          </div>

          {/* Conversation History Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              <MessageSquare size={14} />
              CONVERSATION ({comments.length})
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>
              No replies yet. Send a message below to start the conversation.
            </div>
          ) : (
            comments.map((comment, index) => {
              const isStaff = comment.senderRole === "agent" || comment.senderRole === "admin";
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignSelf: isStaff ? "flex-start" : "flex-end",
                    maxWidth: "85%",
                    background: isStaff ? "#141e33" : "#1a2133",
                    border: `1px solid ${isStaff ? "rgba(99, 102, 241, 0.3)" : "var(--border-color)"}`,
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <strong style={{ color: "#fff" }}>{comment.senderName}</strong>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                          background: isStaff ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.08)",
                          color: isStaff ? "#a5b4fc" : "#94a3b8",
                        }}
                      >
                        {comment.senderRole}
                      </span>
                    </div>

                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p style={{ fontSize: "14px", lineHeight: "1.5", whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
                    {comment.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Reply Input Bar */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-card)",
          }}
        >
          {currentTicket.status === "Closed" ? (
            <div style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", padding: "8px" }}>
              🔒 This ticket is closed. Reopen the ticket to continue the conversation.
            </div>
          ) : (
            <form onSubmit={handleSendReply} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder={isAgentOrAdmin ? "Type a response to the customer..." : "Type your reply or additional information..."}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingReply || !replyText.trim()}
              >
                <Send size={16} />
                <span>{submittingReply ? "Sending..." : "Reply"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;

