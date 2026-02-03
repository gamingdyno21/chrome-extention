import React from "react";
import StatsCards from "./StatsCards";
import DailyView from "./DailyView";
import WeeklyView from "./WeeklyView";
import "./dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Productivity Dashboard</h2>

      <StatsCards />
      <DailyView />
      <WeeklyView />
    </div>
  );
}

export default Dashboard;
