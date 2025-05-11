import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./InsightsView.css";

const InsightsView: React.FC = () => {
  return (
    <div className="insights-view">
      <header className="view-header">
        <h1>Data Insights</h1>
      </header>
      <nav className="insights-subnav">
        <ul>
          <li>
            <NavLink to="collisions-by-region">Collisions by Region</NavLink>
          </li>
          {/* Add more sub-navigation links for other insights here */}
          {/* e.g., <li><NavLink to="accident-heatmap">Accident Heatmap</NavLink></li> */}
        </ul>
      </nav>
      <div className="insights-content-area">
        <Outlet /> {/* Specific insight components will render here */}
      </div>
    </div>
  );
};

export default InsightsView;
