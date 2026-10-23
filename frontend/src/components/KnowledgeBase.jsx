import React, { useState } from "react";
import { Search, HelpCircle, ChevronDown, ChevronUp, LifeBuoy, CreditCard, Shield, Wrench, MessageCircle } from "lucide-react";

const FAQ_DATA = [
  {
    id: 1,
    category: "Billing",
    question: "Payment was deducted but my subscription/order is still pending?",
    answer:
      "UPI or bank transactions sometimes take up to 15-30 minutes to settle. If your transaction status does not update within 1 hour, please raise a ticket under the 'Billing' category with your Transaction/UTR ID, and our billing agents will verify it manually.",
  },
  {
    id: 2,
    category: "Billing",
    question: "How do I request a refund?",
    answer:
      "Refund requests are eligible within 14 days of purchase. Simply create a support ticket with your invoice details and reason for the refund. Our accounts team processes refunds within 3-5 business days.",
  },
  {
    id: 3,
    category: "Account",
    question: "How can I change my email or account role?",
    answer:
      "You can update your profile details under account settings. For security reasons, role elevation (to Support Agent or Admin) requires approval from an existing System Administrator.",
  },
  {
    id: 4,
    category: "Technical",
    question: "Getting a 500 or Network Timeout error when submitting forms?",
    answer:
      "Ensure you have an active internet connection and that your browser is not blocking cookies/CORS headers. If the problem persists, capture the exact error message and open a ticket under 'Technical Bug'.",
  },
  {
    id: 5,
    category: "Technical",
    question: "What is the expected turnaround time for ticket resolution?",
    answer:
      "Urgent priority issues are addressed within 1-2 hours. High priority tickets within 6 hours. General inquiries and feature requests are typically answered within 24 business hours.",
  },
  {
    id: 6,
    category: "General",
    question: "How do I track the status of my tickets?",
    answer:
      "All your raised requests appear on the main Tickets Dashboard. You can filter by Open, In Progress, or Resolved, and click on any ticket to view live responses from support staff.",
  },
];

const KnowledgeBase = ({ onOpenCreateTicket }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openIds, setOpenIds] = useState([1]);

  const toggleAccordion = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px 0 60px" }}>
      {/* 1. Header Banner */}
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          background: "linear-gradient(180deg, rgba(79, 70, 229, 0.1) 0%, rgba(15, 20, 31, 0) 100%)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          marginBottom: "36px",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "var(--primary-light)",
            color: "var(--primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <LifeBuoy size={28} />
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.5px" }}>
          How can we help you today?
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto 28px" }}>
          Search our knowledge base for answers to common questions about billing, account security, and technical issues.
        </p>

        {/* Search Bar */}
        <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "14px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Type your question or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{
              padding: "13px 18px 13px 46px",
              fontSize: "15px",
              borderRadius: "30px",
              background: "#141c2c",
            }}
          />
        </div>
      </div>

      {/* 2. Category Chips */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "32px" }}>
        {[
          { label: "All", icon: HelpCircle },
          { label: "Billing", icon: CreditCard },
          { label: "Account", icon: Shield },
          { label: "Technical", icon: Wrench },
          { label: "General", icon: MessageCircle },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setSelectedCategory(label)}
            className="btn"
            style={{
              background: selectedCategory === label ? "var(--primary)" : "var(--bg-card)",
              color: selectedCategory === label ? "#fff" : "var(--text-secondary)",
              borderColor: selectedCategory === label ? "var(--primary)" : "var(--border-color)",
              padding: "8px 16px",
              borderRadius: "20px",
            }}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* 3. FAQ Accordion List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "48px" }}>
        {filteredFaqs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No help articles found matching "{search}".
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="card-panel"
                style={{
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  onClick={() => toggleAccordion(faq.id)}
                  style={{
                    padding: "18px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    background: isOpen ? "rgba(255, 255, 255, 0.02)" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="badge badge-category" style={{ fontSize: "11px" }}>
                      {faq.category}
                    </span>
                    <h3 style={{ fontSize: "15px", fontWeight: 600 }}>{faq.question}</h3>
                  </div>

                  {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 20px 20px 20px",
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                      borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                      paddingTop: "14px",
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Still Need Help Box */}
      <div
        className="card-panel"
        style={{
          padding: "32px",
          textAlign: "center",
          background: "#121929",
          border: "1px solid rgba(79, 70, 229, 0.3)",
        }}
      >
        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
          Didn't find what you're looking for?
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
          Our customer service team is online and ready to assist you directly.
        </p>
        <button className="btn btn-primary" onClick={onOpenCreateTicket}>
          Open a Support Ticket
        </button>
      </div>
    </div>
  );
};

export default KnowledgeBase;

