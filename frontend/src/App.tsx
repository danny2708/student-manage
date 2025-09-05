import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./components/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/redirect" replace /></ProtectedRoute>} />
      <Route path="/dashboard/redirect" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
      <Route path="/dashboard/manager" element={<ProtectedRoute requiredRoles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/teacher" element={<ProtectedRoute requiredRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/student" element={<ProtectedRoute requiredRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/parent" element={<ProtectedRoute requiredRoles={["parent"]}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user?.roles?.length) return <Navigate to="/login" replace />;

  if (user.roles.includes("manager")) return <Navigate to="/dashboard/manager" replace />;
  if (user.roles.includes("teacher")) return <Navigate to="/dashboard/teacher" replace />;
  if (user.roles.includes("student")) return <Navigate to="/dashboard/student" replace />;
  if (user.roles.includes("parent")) return <Navigate to="/dashboard/parent" replace />;

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
