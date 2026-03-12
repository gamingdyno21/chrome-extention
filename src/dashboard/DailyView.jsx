import React, { useEffect, useState } from "react";
import { formatSeconds, getTodayKey } from "../utils/timeTracker";

function DailyView() {
  const [sites, setSites]   = useState([]);
  const [trend, setTrend]   = useState("neutral");
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const today = new Date();
    const todayKey = getTodayKey();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    chrome.storage.local.get([todayKey, yesterdayKey], (res) => {
      const todayData = res[todayKey] || null;
      const yesterdayData = res[yesterdayKey] || null;

      if (!todayData) { setHasData(false); return; }
      setHasData(true);

      // Trend arrow
      const todayScore = (todayData.productiveTime || 0) - (todayData.distractingTime || 0);
      const yesterdayScore = (yesterdayData?.productiveTime || 0) - (yesterdayData?.distractingTime || 0);

      if (!yesterdayData) {
        setTrend(todayScore > 0 ? "up" : todayScore < 0 ? "down" : "neutral");
      } else {
        setTrend(todayScore > yesterdayScore ? "up" : todayScore < yesterdayScore ? "down" : "neutral");
      }

      // Process sites into split entries based on breakdown
      const displaySites = [];
      Object.entries(todayData.sites || {}).forEach(([domain, info]) => {
        if (info.breakdown) {
          Object.entries(info.breakdown).forEach(([cat, time]) => {
            if (time > 0) {
              displaySites.push({ 
                id: `${domain}-${cat}`, 
                domain: domain, 
                displayDomain: domain + (cat !== "neutral" ? ` (${cat})` : ""),
                time, 
                category: cat 
              });
            }
          });
        } else {
          // Fallback for legacy data
          displaySites.push({ 
            id: domain, 
            domain, 
            displayDomain: domain,
            time: info.time, 
            category: info.category 
          });
        }
      });

      const sorted = displaySites.sort((a, b) => b.time - a.time);
      setSites(sorted);
    });
  }, []);

  const maxTime = sites[0]?.time || 1;

  return (
    <div className="card">
      <h3>
        📅 Today
        {trend === "up"   && <span className="green" style={{ fontSize: 14 }}> ▲ Better than yesterday</span>}
        {trend === "down" && <span className="red"   style={{ fontSize: 14 }}> ▼ Worse than yesterday</span>}
      </h3>

      {!hasData ? (
        <div className="empty-state">
          <div className="icon">⏳</div>
          <p>No data yet — browse a few sites first</p>
        </div>
      ) : sites.length === 0 ? (
        <p className="muted">No site data recorded today</p>
      ) : (
        sites.map(({ id, domain, displayDomain, time, category }) => (
          <div key={id} className="stat-row">
            <div className="site-info">
              <span className="site-name">{displayDomain}</span>
              <span className={`badge ${category}`}>{category}</span>
            </div>
            <div className="time-bar-wrap">
              <div className="bar-track">
                <div
                  className={`bar-fill ${category}`}
                  style={{ width: `${Math.round((time / maxTime) * 100)}%` }}
                />
              </div>
              <span className="time-val">{formatSeconds(time)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default DailyView;
