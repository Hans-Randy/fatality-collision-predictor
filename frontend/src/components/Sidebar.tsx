import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css"; // We'll create this for styling

const Sidebar: React.FC = () => {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const toggleInsightsMenu = () => {
    setIsInsightsOpen(!isInsightsOpen);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Collision Predictor</h3> {/* Or your app name */}
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
              end
            >
              Predictor
            </NavLink>
          </li>
          <li>
            {/* Main Insights link - can navigate to a general insights page or just toggle submenu */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toggleInsightsMenu();
              }}
              className={`insights-toggle ${isInsightsOpen ? "active" : ""}`}
            >
              Insights {isInsightsOpen ? "▼" : "▶"}
            </a>
            {/* Always render submenu, toggle class for open/close animation */}
            <ul className={`submenu ${isInsightsOpen ? "open" : ""}`}>
              <li>
                <NavLink
                  to="/insights/collisions-by-region"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Collisions by Region
                </NavLink>
              </li>
              {/* Add more specific insight links here */}
              {/* Example: 
              <li>
                <NavLink to="/insights/accident-heatmap" className={({ isActive }) => isActive ? 'active' : ''}>
                  Accident Heatmap
                </NavLink>
              </li>
              */}
            </ul>
          </li>
          {/* Add more links here as new sections are developed */}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>App Version 1.0</p> {/* Example footer content */}
      </div>
    </div>
  );
};

export default Sidebar;
