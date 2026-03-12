import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, Tooltip
} from "recharts";
import { formatSeconds, getTodayKey } from "../utils/timeTracker";

const COLORS = ["#00e676", "#ff5252", "#448aff"];

function StatsCards() {
  const [today, setToday] = useState({});
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    const todayKey = getTodayKey();
    const loadStats = () => {
      chrome.storage.local.get(null, (data) => {
        const dayData = data[todayKey] || {};
        setToday(dayData);

        const dates = Object.keys(data)
          .filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))
          .sort()
          .slice(-7);

        const points = dates.map((d) => {
          const day = data[d] || {};
          return {
            date: d.slice(5),
            value: Math.round(((day.productiveTime || 0) - (day.distractingTime || 0)) / 60)
          };
        });
        setTrend(points);
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const productive = today.productiveTime || 0;
  const distracting = today.distractingTime || 0;
  const neutral = Math.max(0, (today.totalTime || 0) - productive - distracting);
  const total       = productive + distracting;

  const chartData = [
    { name: "Productive", value: Math.round(productive / 60) || 0 },
    { name: "Distracting", value: Math.round(distracting / 60) || 0 }
  ].filter((d) => d.value > 0);

  return (
    <>
      {/* Metric cards */}
      <div className="stats-grid">
        <div className="metric-box productive">
          <div className="m-label">Productive</div>
          <div className="m-value">{formatSeconds(productive)}</div>
        </div>
        <div className="metric-box distracting">
          <div className="m-label">Distracting</div>
          <div className="m-value">{formatSeconds(distracting)}</div>
        </div>
        <div className="metric-box neutral">
          <div className="m-label">Net Score</div>
          <div className="m-value" style={{ color: (productive - distracting) >= 0 ? "var(--accent)" : "var(--danger)" }}>
            {(productive - distracting) >= 0 ? "+" : ""}
            {formatSeconds(Math.abs(productive - distracting))}
          </div>
        </div>
      </div>

      {/* Donut + sparkline row */}
      <div className="card" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180} minWidth={100} minHeight={100} initialDimension={{ width: 180, height: 180 }}>
                <PieChart>
                  <Pie data={chartData} innerRadius={56} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{formatSeconds(total)}</div>
                <div style={{ fontSize: 11, color: "var(--text-sub)" }}>total</div>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ height: 180 }}>
              <div className="icon">📊</div>
              <p>No data yet</p>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>7-Day Net Trend (min)</div>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={90} minWidth={100} minHeight={50} initialDimension={{ width: 200, height: 90 }}>
              <LineChart data={trend}>
                <Line type="monotone" dataKey="value" stroke="#00e676" strokeWidth={2} dot={false} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "var(--text-sub)" }}
                  formatter={(v) => [`${v} min`, "Net"]}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">No trend data yet</p>
          )}
        </div>
      </div>
    </>
  );
}

export default StatsCards;
