import React, { useState, useEffect } from "react";
import StatsCards  from "./StatsCards";
import DailyView   from "./DailyView";
import WeeklyView  from "./WeeklyView";
import GoalsPanel  from "./GoalsPanel";
import "./dashboard.css";
import "../styles/theme.css";

const TABS = [
  { id: "today",  label: "📅 Today" },
  { id: "week",   label: "📆 Week" },
  { id: "goals",  label: "🎯 Goals" }
];

function Dashboard() {
  const [tab,   setTab]   = useState("today");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Flush current tracking data so stats are up-to-date
    chrome.runtime.sendMessage({ type: "FLUSH_TIME" }, () => {
      // We don't necessarily need to wait, but it ensures storage is updated
    });
  }, []);

  return (
    <div className="dashboard">
      {/* Sticky topbar */}
      <div className="topbar">
        <div className="topbar-logo">
          <span>⏱</span>
          <span>Productivity <span className="accent">Tracker</span></span>
        </div>
        <div className="topbar-controls">
          <button className="theme-toggle" onClick={() => setTheme((t) => t === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="tab-nav">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`tab-btn${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {tab === "today" && (
          <>
            <StatsCards />
            <DailyView />
          </>
        )}
        {tab === "week" && <WeeklyView />}
        {tab === "goals" && <GoalsPanel />}
      </div>
    </div>
  );
}

export default Dashboard;
