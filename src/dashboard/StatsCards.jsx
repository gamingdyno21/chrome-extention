import React, { useEffect, useState } from "react";
import NetTrendLine from "./NetTrendLine";

function calculateOverallTrend(today, yesterday) {
  const todayScore =
    (today?.productiveTime || 0) -
    (today?.distractingTime || 0);

  if (yesterday) {
    const yesterdayScore =
      (yesterday.productiveTime || 0) -
      (yesterday.distractingTime || 0);

    if (todayScore > yesterdayScore) return "up";
    if (todayScore < yesterdayScore) return "down";
    return "neutral";
  }

  // No yesterday → direction only
  if (todayScore > 0) return "up";
  if (todayScore < 0) return "down";
  return "neutral";
}

function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    productive: 0,
    distracting: 0
  });
  const [trend, setTrend] = useState("neutral");

  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      let total = 0,
        productive = 0,
        distracting = 0;

      const dates = Object.keys(data).sort();

      dates.forEach((d) => {
        total += data[d]?.totalTime || 0;
        productive += data[d]?.productiveTime || 0;
        distracting += data[d]?.distractingTime || 0;
      });

      const today = data[dates[dates.length - 1]];
      const yesterday = dates.length >= 2 ? data[dates[dates.length - 2]] : null;

      const trendValue = calculateOverallTrend(today, yesterday);
      setTrend(trendValue);

      setStats({ total, productive, distracting });
    });
  }, []);

  const productivePct =
    stats.total > 0 ? (stats.productive / stats.total) * 100 : 0;
  const distractingPct =
    stats.total > 0 ? (stats.distracting / stats.total) * 100 : 0;

  return (
    <div className="card">
      <h3>
        Overall Usage{" "}
        {trend === "up" && <span className="green">▲</span>}
        {trend === "down" && <span className="red">▼</span>}
      </h3>

      <div className="stat-row">
        <span>Total</span>
        <span>{Math.floor(stats.total / 60)} min</span>
      </div>

      <div className="stat-row green">
        <span>Productive</span>
        <span>{Math.floor(stats.productive / 60)} min</span>
      </div>

      <div className="stat-row red">
        <span>Distracting</span>
        <span>{Math.floor(stats.distracting / 60)} min</span>
      </div>

      <div className="progress">
        <div
          style={{
            width: `${productivePct}%`,
            background: "#4caf50"
          }}
        />
        <div
          style={{
            width: `${distractingPct}%`,
            background: "#f44336"
          }}
        />
      </div>

      <h4 style={{ marginTop: 18 }}>Net Productivity Trend</h4>
      <NetTrendLine />
      <p className="muted">
        Net productive vs distracting momentum
      </p>
    </div>
  );
}

export default StatsCards;
