import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TicketListPage from "./pages/TicketListPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import KnowledgePage from "./pages/KnowledgePage";
import ProfilePage from "./pages/ProfilePage";
import AgentPerformancePage from "./pages/AgentPerformancePage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* App Layout with Navigation Shell */}
          <Route path="/" element={<Layout />}>
            {/* Redirect root to /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard: Status counts, metric cards, charts, and recent tickets */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Ticket Queue / List: Table with filters, pagination, and search */}
            <Route
              path="tickets"
              element={
                <ProtectedRoute>
                  <TicketListPage />
                </ProtectedRoute>
              }
            />

            {/* Create Ticket: Dedicated form for Customers only */}
            <Route
              path="tickets/new"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CreateTicketPage />
                </ProtectedRoute>
              }
            />

            {/* Ticket Detail: ID-based view with details, status update, and comment thread */}
            <Route
              path="tickets/:id"
              element={
                <ProtectedRoute>
                  <TicketDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Knowledge Base (Customer privilege) */}
            <Route
              path="knowledge"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <KnowledgePage />
                </ProtectedRoute>
              }
            />

            {/* Agent Performance Analytics: Admin only */}
            <Route
              path="admin/agent-performance"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AgentPerformancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="agents/performance"
              element={<Navigate to="/admin/agent-performance" replace />}
            />

            {/* User Profile & Privileges */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 404 Preview */}
            <Route path="404-preview" element={<NotFoundPage />} />

            {/* 404 Catch-All Page within layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Global 404 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
