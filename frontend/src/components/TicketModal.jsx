import React, { useState, useRef } from "react";
import { X, AlertCircle, Image as ImageIcon, Trash2, Paperclip } from "lucide-react";
import { api } from "../api";

const TicketModal = ({ isOpen, onClose, onTicketCreated, showToast }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    priority: "Low",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // Validate file type
      if (!selected.type.startsWith("image/")) {
        setError("Please select an image file (PNG, JPG, WEBP, GIF)");
        return;
      }
      // Validate file size (max 5MB)
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size cannot exceed 5MB");
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please fill out both the title and description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newTicket = await api.createTicket(formData, file);
      onTicketCreated(newTicket);
      showToast("Support ticket created successfully!", "success");
      onClose();
      setFormData({ title: "", description: "", category: "General", priority: "Low" });
      handleRemoveFile();
    } catch (err) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
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
          maxWidth: "560px",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "28px",
          background: "var(--bg-card)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Open New Support Ticket</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Our support team will respond as soon as possible.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--danger-bg)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Ticket Subject / Title <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. UPI payment succeeded but order status is pending"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
              >
                <option value="General">General Inquiry</option>
                <option value="Billing">Billing & Payments</option>
                <option value="Technical">Technical Bug</option>
                <option value="Account">Account & Security</option>
                <option value="Feature Request">Feature Request</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent (Critical)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Detailed Description <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Provide exact details, relevant IDs, or steps to reproduce the issue..."
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              style={{ resize: "vertical" }}
            />
          </div>

          {/* File Attachment Upload */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Attachment (Optional Screenshot / Image)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="ticket-file-input"
            />

            {!file ? (
              <label
                htmlFor="ticket-file-input"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "16px",
                  border: "2px dashed var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  transition: "border-color 0.2s",
                }}
              >
                <Paperclip size={16} />
                <span>Click to attach a screenshot (PNG, JPG, max 5MB)</span>
              </label>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px" }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </p>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="btn btn-secondary btn-sm"
                  style={{ color: "var(--danger)" }}
                  title="Remove file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
