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

  useEffect(() => {
    if (isAuthenticated) {
      api.getStats()
        .then((data) => {
          if (data && typeof data.open === "number") {
            setOpenCount(data.open);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar openTicketCount={openCount} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <TopBar />
        <main style={{ padding: "28px", flex: 1, minHeight: 0 }}>
          <Outlet context={{ refreshOpenCount: () => {
            api.getStats().then(d => d && setOpenCount(d.open)).catch(() => {});
          } }} />
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

