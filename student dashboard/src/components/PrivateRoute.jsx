import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Authentication";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth(); // Get authentication state from AuthContext
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the child component
  return children;
};

export default PrivateRoute;
