import React from "react";
import useAuth from "../../hooks/useAuth";
import useRole from "../../hooks/useRole";
import { Navigate } from "react-router";

const RiderRoutes = ({ children }) => {
  const { loading } = useAuth();
  const { role, roleLoading } = useRole();
  if (loading || roleLoading) {
    return <span className="loading loading-infinity loading-xl"></span>;
  }
  if (loading || roleLoading) {
    return <Navigate to="/login" />;
  }
  if (role !== "rider") {
    return (
      <div>
        <h1>You are not authorized to access this page</h1>
      </div>
    );
  }
  return children;
};

export default RiderRoutes;
