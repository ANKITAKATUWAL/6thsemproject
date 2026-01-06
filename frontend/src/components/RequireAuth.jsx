import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = (user.role || '').toString().toUpperCase();
  if (allowedRoles.length > 0 && !allowedRoles.map(r => r.toUpperCase()).includes(role)) {
    return <Navigate to="/" replace />;
  }

  // If route requires DOCTOR and the doctor has no profile, redirect to details form
  // Avoid redirect loop when already on the details page
  if (allowedRoles.map(r => r.toUpperCase()).includes('DOCTOR') && role === 'DOCTOR' && !user.doctor && location.pathname !== '/doctor-details') {
    return <Navigate to="/doctor-details" replace />;
  }

  return children;
}
