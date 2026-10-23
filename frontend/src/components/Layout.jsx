import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const Layout = () => {
  const { toast, isAuthenticated } = useAuth();
  const [openCount, setOpenCount] = useState(0);

  const applyUnresolvedCount = (data) => {
    if (!data) return;
    const unresolved =
      typeof data.unresolved === "number"
        ? data.unresolved
        : (data.open || 0) + (data.inProgress || 0);
    setOpenCount(unresolved);
  };

  const refreshOpenCount = () => {
    if (isAuthenticated) {
      api.getStats(true)
        .then(applyUnresolvedCount)
        .catch(() => {});
    }
  };

  useEffect(() => {
    refreshOpenCount();
  }, [isAuthenticated]);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar openTicketCount={openCount} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <TopBar />
        <main style={{ padding: "28px", flex: 1, minHeight: 0 }}>
          <Outlet context={{ refreshOpenCount }} />
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div
          className={`toast ${
            toast.type === "error"
              ? "toast-error"
              : toast.type === "info"
              ? "toast-info"
              : "toast-success"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={18} />
          ) : toast.type === "info" ? (
            <Info size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Layout;

