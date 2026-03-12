import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getRecentKeys, formatSeconds, dayLabel } from "../utils/timeTracker";

function WeeklyView() {
  const [chartData, setChartData] = useState([]);
  const [topSites, setTopSites] = useState({ productive: [], distracting: [] });
  const [trend, setTrend] = useState("neutral");

  useEffect(() => {
    const thisWeekKeys = getRecentKeys(7);
    const lastWeekKeys = getRecentKeys(14).slice(0, 7);

    chrome.storage.local.get(null, (data) => {
      let thisScore = 0;
      let lastScore = 0;
      const prodSites = {};
      const distSites = {};

      // build bar chart
      const bars = thisWeekKeys.map((key) => {
        const day = data[key] || {};
        const productive  = Math.round((day.productiveTime  || 0) / 60);
        const distracting = Math.round((day.distractingTime || 0) / 60);
        thisScore += (day.productiveTime || 0) - (day.distractingTime || 0);

        // Aggregate top sites using new breakdown logic
        Object.entries(day.sites || {}).forEach(([site, info]) => {
          if (info.breakdown) {
            Object.entries(info.breakdown).forEach(([cat, time]) => {
              if (cat === "productive") prodSites[site] = (prodSites[site] || 0) + time;
              else if (cat === "distracting") distSites[site] = (distSites[site] || 0) + time;
            });
          } else {
            // Legacy fallback
            if (info.category === "productive") prodSites[site] = (prodSites[site] || 0) + info.time;
            else if (info.category === "distracting") distSites[site] = (distSites[site] || 0) + info.time;
          }
        });

        return { day: dayLabel(key), productive, distracting };
      });

      // trend score
      lastWeekKeys.forEach((key) => {
        const day = data[key] || {};
        lastScore += (day.productiveTime || 0) - (day.distractingTime || 0);
      });

      if (lastScore === 0) {
        setTrend(thisScore > 0 ? "up" : thisScore < 0 ? "down" : "neutral");
      } else {
        setTrend(thisScore > lastScore ? "up" : thisScore < lastScore ? "down" : "neutral");
      }

      setChartData(bars);
      setTopSites({
        productive:  Object.entries(prodSites).sort((a, b) => b[1] - a[1]).slice(0, 5),
        distracting: Object.entries(distSites).sort((a, b) => b[1] - a[1]).slice(0, 5)
      });
    });
  }, []);

  const maxTime = Math.max(...chartData.map((d) => d.productive + d.distracting), 1);

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ color: p.fill }}>
            {p.name}: {p.value}m
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Weekly Bar Chart */}
      <div className="card">
        <h3>
          📆 Last 7 Days
          {trend === "up"   && <span className="green" style={{ fontSize: 14 }}> ▲ Better than last week</span>}
          {trend === "down" && <span className="red"   style={{ fontSize: 14 }}> ▼ Worse than last week</span>}
        </h3>

        {chartData.every((d) => d.productive === 0 && d.distracting === 0) ? (
          <div className="empty-state">
            <div className="icon">📡</div>
            <p>No weekly data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220} minWidth={200} minHeight={150} initialDimension={{ width: 400, height: 220 }}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="day" tick={{ fill: "var(--text-sub)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-sub)", fontSize: 11 }} axisLine={false} tickLine={false} unit="m" />
              <Tooltip content={customTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-sub)" }} />
              <Bar dataKey="productive"  name="Productive"  fill="#00e676" radius={[4, 4, 0, 0]} />
              <Bar dataKey="distracting" name="Distracting" fill="#ff5252" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* weekly top sites */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ color: "var(--accent)" }}>✅ Top Productive</h3>
          {topSites.productive.length === 0
            ? <p className="muted">No data</p>
            : topSites.productive.map(([site, time]) => {
                const maxT = topSites.productive[0]?.[1] || 1;
                return (
                  <div key={site} className="stat-row">
                    <span className="site-name">{site}</span>
                    <div className="time-bar-wrap">
                      <div className="bar-track">
                        <div className="bar-fill productive" style={{ width: `${Math.round((time / maxT) * 100)}%` }} />
                      </div>
                      <span className="time-val">{formatSeconds(time)}</span>
                    </div>
                  </div>
                );
              })
          }
        </div>

        <div className="card">
          <h3 style={{ color: "var(--danger)" }}>⛔ Top Distracting</h3>
          {topSites.distracting.length === 0
            ? <p className="muted">No data</p>
            : topSites.distracting.map(([site, time]) => {
                const maxT = topSites.distracting[0]?.[1] || 1;
                return (
                  <div key={site} className="stat-row">
                    <span className="site-name">{site}</span>
                    <div className="time-bar-wrap">
                      <div className="bar-track">
                        <div className="bar-fill distracting" style={{ width: `${Math.round((time / maxT) * 100)}%` }} />
                      </div>
                      <span className="time-val">{formatSeconds(time)}</span>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </>
  );
}

export default WeeklyView;
