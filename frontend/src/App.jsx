// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// --- Page Imports ---
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApprovalPanel from './pages/ApprovalPanel';     
import EmployeeView from './pages/EmployeeView';     
import ManageUser from './pages/ManageUser';     
// --------------------


// --- Protected Route Component ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-red-600 font-bold">403 Access Denied</div>;
  }

  return children;
};


function AppRoutes() {
  const { user } = useAuth(); 

  return (
    <Routes>
      {/* Public/Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Root path redirect */}
      <Route path="/" element={user ? <Navigate to={`/${user.role === 'employee' ? 'employee' : 'admin'}/dashboard`} replace /> : <Navigate to="/login" replace />} />

      {/* ADMIN Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/view-employees" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <EmployeeView />
        </ProtectedRoute>
      } />
      
      {/* Approval and Management Routes (Accessed by Admin role now) */}
      <Route path="/admin/approval" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ApprovalPanel />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-user/:userId" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ManageUser />
        </ProtectedRoute>
      } />

      {/* EMPLOYEE Routes */}
      <Route path="/employee/dashboard" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />

      {/* Fallback 404 */}
      <Route path="*" element={<div className="p-8 text-center text-xl font-bold">404 - Not Found</div>} />
    </Routes>
  );
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
};