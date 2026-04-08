import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, token } = useAuth();
  const savedToken = localStorage.getItem('token');

  if (!isAuthenticated && !savedToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If not authorized for this specific area, redirect to their default dashboard
    if (role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'ROLE_SELLER') return <Navigate to="/seller" replace />;
    if (role === 'ROLE_GARAGE') return <Navigate to="/dashboard" replace />;
    if (role === 'ROLE_CUSTOMER') return <Navigate to="/customer-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
