import React, { useEffect, useState } from "react";

function calculateWeekTrend(thisWeekScore, lastWeekScore) {
  // Case 1: Compare if last week exists
  if (lastWeekScore !== null) {
    if (thisWeekScore > lastWeekScore) return "up";
    if (thisWeekScore < lastWeekScore) return "down";
    return "neutral";
  }

  // Case 2: No previous week → momentum
  if (thisWeekScore > 0) return "up";
  if (thisWeekScore < 0) return "down";
  return "neutral";
}

function WeeklyView() {
  const [weekly, setWeekly] = useState({
    productive: {},
    distracting: {}
  });
  const [trend, setTrend] = useState("neutral");

  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      const dates = Object.keys(data).sort();

      const thisWeek = dates.slice(-7);
      const lastWeek = dates.slice(-14, -7);

      let thisScore = 0,
        lastScore = 0;

      const productive = {};
      const distracting = {};

      thisWeek.forEach((d) => {
        const day = data[d] || {};
        thisScore +=
          (day.productiveTime || 0) -
          (day.distractingTime || 0);

        Object.entries(day.sites || {}).forEach(([site, info]) => {
          if (info.category === "productive") {
            productive[site] =
              (productive[site] || 0) + info.time;
          } else if (info.category === "distracting") {
            distracting[site] =
              (distracting[site] || 0) + info.time;
          }
        });
      });

      lastWeek.forEach((d) => {
        const day = data[d] || {};
        lastScore +=
          (day.productiveTime || 0) -
          (day.distractingTime || 0);
      });

      const trendValue = calculateWeekTrend(thisScore, lastWeek.length ? lastScore : null);
      setTrend(trendValue);

      setWeekly({ productive, distracting });
    });
  }, []);

  const render = (sites, color) =>
    Object.entries(sites)
      .sort((a, b) => b[1] - a[1])
      .map(([site, time]) => (
        <div key={site} className={`stat-row ${color}`}>
          <span>{site}</span>
          <span>{Math.floor(time / 60)} min</span>
        </div>
      ));

  return (
    <div className="card">
      <h3>
        Last 7 Days{" "}
        {trend === "up" && <span className="green">▲</span>}
        {trend === "down" && <span className="red">▼</span>}
      </h3>

      <p className="green">Productive Websites</p>
      {render(weekly.productive, "green")}

      <p className="red" style={{ marginTop: 10 }}>
        Distracting Websites
      </p>
      {render(weekly.distracting, "red")}
    </div>
  );
}

export default WeeklyView;
