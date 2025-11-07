// src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Memuat...</div>;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  return children ?? <Outlet />;
}
