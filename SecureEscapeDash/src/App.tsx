import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { getToken } from "./utils/tokenStore";
import "./App.css";

import RoleRedirect from "./components/RoleRedirect";
import SessionDetail from "./pages/SessionDetailsPage";
import { getAdminUser } from "./utils/tokenStore";
import { hasPermission } from "./constants/permission";
import AnalystSearchPage from "./pages/Analyst/AnalystSearchPage";
import AnalystMyCasesPage from "./pages/Analyst/AnalystMyCasesPage";
import AnalystDashboard from "./pages/Analyst/AnalystDashboard";
import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import ManagerAssignmentsPage from "./pages/Manager/ManagerAssignmentsPage";
import ManagerResolvedPage from "./pages/Manager/ManagerResolvedPage";
import ManagerReportsPage from "./pages/Manager/ManagerReportsPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminBanksPage from "./pages/Admin/AdminBanksPage";
import AdminAuditLogsPage from "./pages/Admin/AdminAuditLogsPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AnalystOpenCasesPage from "./pages/Analyst/AnalystOpenCasesPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleProtectedRoute({
  permission,
  children,
}: {
  permission: Parameters<typeof hasPermission>[1];
  children: React.ReactNode;
}) {
  const token = getToken();
  const admin = getAdminUser();

  if (!token || !admin) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(admin.adminRole, permission)) {
    return <RoleRedirect />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ANALYST ROUTES */}
        <Route
          path="/analyst"
          element={
            <RoleProtectedRoute permission="viewAnalystDashboard">
              <AnalystDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/analyst/open-cases"
          element={
            <RoleProtectedRoute permission="viewAnalystDashboard">
              <AnalystOpenCasesPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/analyst/cases"
          element={
            <RoleProtectedRoute permission="viewAnalystDashboard">
              <AnalystMyCasesPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/analyst/search"
          element={
            <RoleProtectedRoute permission="viewAnalystDashboard">
              <AnalystSearchPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <RoleProtectedRoute permission="viewManagerDashboard">
              <ManagerDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/manager/assignments"
          element={
            <RoleProtectedRoute permission="assignCases">
              <ManagerAssignmentsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/manager/resolved"
          element={
            <RoleProtectedRoute permission="approveResolvedCases">
              <ManagerResolvedPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/manager/reports"
          element={
            <RoleProtectedRoute permission="viewManagerDashboard">
              <ManagerReportsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute permission="viewAdminDashboard">
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/banks"
          element={
            <RoleProtectedRoute permission="viewPlatformStats">
              <AdminBanksPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/audit"
          element={
            <RoleProtectedRoute permission="viewAuditLogs">
              <AdminAuditLogsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute permission="manageUsers">
              <AdminUsersPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/sessions/:id"
          element={
            <RoleProtectedRoute permission="viewCaseOverview">
              <SessionDetail />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
