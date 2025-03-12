import React from "react";
import { Navigate } from "react-router-dom";

/**
 * A wrapper component that redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ session, children }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 