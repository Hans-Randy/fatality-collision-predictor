import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet /> {/* Nested routes will render here */}
      </main>
    </div>
  );
};

export default DashboardLayout;
