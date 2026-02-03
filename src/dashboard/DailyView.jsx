import React, { useEffect, useState } from "react";

function calculateDailyTrend(today, yesterday) {
  const todayScore =
    (today?.productiveTime || 0) -
    (today?.distractingTime || 0);

  // Case 1: Yesterday exists → compare (classic)
  if (yesterday) {
    const yesterdayScore =
      (yesterday.productiveTime || 0) -
      (yesterday.distractingTime || 0);

    if (todayScore > yesterdayScore) return "up";
    if (todayScore < yesterdayScore) return "down";
    return "neutral";
  }

  // Case 2: No yesterday → direction-only (important!)
  if (todayScore > 0) return "up";
  if (todayScore < 0) return "down";
  return "neutral";
}

function DailyView() {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState("neutral");

  useEffect(() => {
    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    chrome.storage.local.get([todayKey, yesterdayKey], (res) => {
      const todayData = res[todayKey];
      const yesterdayData = res[yesterdayKey];

      const trendValue = calculateDailyTrend(todayData, yesterdayData);
      setTrend(trendValue);

      setData(todayData);
    });
  }, []);

  if (!data) {
    return (
      <div className="card">
        <h3>Today</h3>
        <p className="muted">No activity yet</p>
      </div>
    );
  }

  const sites = Object.entries(data.sites || {}).sort(
    (a, b) => b[1].time - a[1].time
  );

  return (
    <div className="card">
      <h3>
        Today{" "}
        {trend === "up" && <span className="green">▲</span>}
        {trend === "down" && <span className="red">▼</span>}
      </h3>

      {sites.map(([site, info]) => (
        <div key={site} className="stat-row">
          <span>
            {site}{" "}
            {info.category === "productive" && (
              <span className="green">●</span>
            )}
            {info.category === "distracting" && (
              <span className="red">●</span>
            )}
          </span>
          <span>{Math.floor(info.time / 60)} min</span>
        </div>
      ))}
    </div>
  );
}

export default DailyView;
