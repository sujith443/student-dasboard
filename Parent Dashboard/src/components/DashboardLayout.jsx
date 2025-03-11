import React from "react";
import { Outlet } from "react-router-dom";
import CustomSidebar from "./sidebar";

const DashboardLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <CustomSidebar />

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        <Outlet /> {/* This will render the nested routes (Dashboard, Profile, etc.) */}
      </div>
    </div>
  );
};

export default DashboardLayout;
