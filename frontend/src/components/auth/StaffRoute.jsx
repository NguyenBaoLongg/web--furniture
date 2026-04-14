import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // StaffRoute allows both 'staff' and 'admin' roles
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
