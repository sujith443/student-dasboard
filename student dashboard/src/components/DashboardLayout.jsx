import React from "react";
import { Outlet } from "react-router-dom";
import CustomSidebar from "./Sidebar";

const DashboardLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar (Fixed) */}
      <div style={{ width: "250px", flexShrink: 0, height: "100vh", overflowY: "auto", background: "#f4f4f4" }}>
        <CustomSidebar />
      </div>

      {/* Main Content (Scrollable) */}
      <div style={{ flex: 1, overflowY: "auto", height: "100vh", padding: "16px" }}>
        <Outlet /> {/* This will render the nested routes */}
      </div>
    </div>
  );
};

export default DashboardLayout;
