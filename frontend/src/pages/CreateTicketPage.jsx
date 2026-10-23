import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Paperclip, 
  ShieldAlert, 
  Clock, 
  HelpCircle,
  Sparkles,
  Ticket
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const CreateTicketPage = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "customer") {
      showToast("Access restricted: Only customers can create support tickets.", "info");
      navigate("/tickets", { replace: true });
    }
  }, [user, navigate]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [priority, setPriority] = useState("Medium");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { id: "Technical", label: "Technical", desc: "Bugs, crashes, server errors" },
    { id: "Billing", label: "Billing", desc: "Invoices, refunds, payment status" },
    { id: "Account", label: "Account", desc: "Login, security, profile updates" },
    { id: "General", label: "General", desc: "Product questions and feedback" },
  ];

  const priorities = [
    { id: "Low", label: "Low Priority", sla: "SLA: < 24 Hours", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
    { id: "Medium", label: "Medium Priority", sla: "SLA: < 12 Hours", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
    { id: "High", label: "High Priority", sla: "SLA: < 2 Hours", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        showToast("File size exceeds 5MB limit", "error");
        return;
      }
      setFile(selected);
      if (selected.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selected));
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = "Ticket subject / title is required.";
    } else if (title.trim().length < 5) {
      errs.title = "Title must be at least 5 characters.";
    }

    if (!description.trim()) {
      errs.description = "Please describe the problem you are experiencing.";
    } else if (description.trim().length < 15) {
      errs.description = "Description should be at least 15 characters to help us resolve faster.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const createdTicket = await api.createTicket(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
        },
        file
      );

      showToast("Support ticket created successfully! 🚀", "success");
      navigate(`/tickets/${createdTicket._id}`);
    } catch (err) {
      showToast(err.message || "Failed to submit ticket", "error");
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role !== "customer") {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "36px 28px" }} className="card-panel">
        <ShieldAlert size={48} color="var(--accent-teal)" style={{ marginBottom: "16px" }} />
        <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Customer Only Action</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "10px", fontSize: "14px", lineHeight: "1.6" }}>
          Only customers have the right to create support tickets. As an <strong>{user.role === "admin" ? "Administrator" : "Support Agent"}</strong>, your role is to review, troubleshoot, and manage customer tickets.
        </p>
        <button
          onClick={() => navigate("/tickets")}
          className="btn btn-primary"
          style={{ marginTop: "24px" }}
        >
          <Ticket size={16} />
          <span>Go to Ticket Queue</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Breadcrumb Trail */}
      <div className="breadcrumb-trail">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <Link to="/tickets">Tickets</Link>
        <span>/</span>
        <span className="breadcrumb-active">New Ticket</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        {/* Main Form Column */}
        <div className="card-panel" style={{ padding: "30px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.4px" }}>
              Submit a Support Ticket
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Please provide clear details so our engineering and support specialists can assist you rapidly.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {/* Title Input */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Subject / Title *</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{title.length}/100</span>
              </div>
              <input
                type="text"
                maxLength={100}
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                }}
                placeholder="e.g. Payment deducted but premium plan is still inactive"
                className="form-input"
              />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>

            {/* Category Selector */}
            <div>
              <label className="form-label">Select Issue Category *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      border: category === c.id ? "2px solid var(--accent-teal)" : "1px solid var(--border-color)",
                      background: category === c.id ? "var(--primary-light)" : "var(--bg-input)",
                      color: category === c.id ? "var(--accent-teal)" : "var(--text-secondary)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>{c.label}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="form-label">Priority Level *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {priorities.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      style={{
                        padding: "14px",
                        borderRadius: "var(--radius-md)",
                        border: isSelected ? `2px solid ${p.color}` : "1px solid var(--border-color)",
                        background: isSelected ? p.bg : "var(--bg-input)",
                        color: isSelected ? p.color : "var(--text-secondary)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "13px" }}>{p.label}</div>
                      <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.85 }}>{p.sla}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="form-label">Detailed Description *</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                }}
                placeholder="Explain the issue step-by-step. Include error messages, account identifiers, or transaction timestamps..."
                className="form-input"
                style={{ resize: "vertical" }}
              />
              {errors.description && <p className="form-error">{errors.description}</p>}
            </div>

            {/* Attachment Dropzone */}
            <div>
              <label className="form-label">Attachment (Screenshot or Logs - Optional)</label>
              {!file ? (
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    border: "2px dashed var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-input)",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFile = e.dataTransfer.files?.[0];
                    if (droppedFile) {
                      setFile(droppedFile);
                      if (droppedFile.type.startsWith("image/")) {
                        setFilePreview(URL.createObjectURL(droppedFile));
                      }
                    }
                  }}
                >
                  <UploadCloud size={28} color="var(--accent-teal)" style={{ marginBottom: "8px" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    Click or drag file to upload
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    PNG, JPG, PDF up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    ) : (
                      <Paperclip size={20} color="var(--accent-teal)" />
                    )}
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600 }}>{file.name}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "6px 8px" }}
                    title="Remove attachment"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => navigate("/tickets")}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ minWidth: "160px" }}
              >
                {loading ? "Submitting Ticket..." : "Submit Support Ticket"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Guidelines Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* SLA Response Guide Card */}
          <div className="card-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Clock size={16} color="var(--accent-teal)" />
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Service Level Commitments</h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "14px" }}>
              Our dedicated tier-1 and tier-2 specialists review issues based on severity:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              <div style={{ padding: "8px 10px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", borderLeft: "3px solid #ef4444" }}>
                <strong style={{ color: "#f87171" }}>High Priority:</strong> Response within 2 hours
              </div>
              <div style={{ padding: "8px 10px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", borderLeft: "3px solid #f59e0b" }}>
                <strong style={{ color: "#fbbf24" }}>Medium Priority:</strong> Response within 12 hours
              </div>
              <div style={{ padding: "8px 10px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", borderLeft: "3px solid #10b981" }}>
                <strong style={{ color: "#34d399" }}>Low Priority:</strong> Response within 24 hours
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="card-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <HelpCircle size={16} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Tips for Faster Resolution</h3>
            </div>
            <ul style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6", paddingLeft: "16px" }}>
              <li>Attach full screenshots including browser console if technical.</li>
              <li>Provide exact transaction IDs for payment or billing tickets.</li>
              <li>Specify what you expected vs what actually happened.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;

