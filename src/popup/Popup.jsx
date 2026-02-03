import React, { useEffect, useState } from "react";
import { getLatestData } from "../utils/storage";

function formatTime(seconds) {
  return Math.floor(seconds / 60) + " min";
}

function Popup() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getLatestData(setInfo);
  }, []);

  if (!info) {
    return <p style={{ padding: 10 }}>No data yet</p>;
  }

  const { date, data } = info;

  return (
    <div style={{ padding: 12, width: 260 }}>
      <h3>{date}</h3>

      <p><b>Total:</b> {formatTime(data.totalTime)}</p>
      <p style={{ color: "green" }}>
        <b>Productive:</b> {formatTime(data.productiveTime || 0)}
      </p>
      <p style={{ color: "red" }}>
        <b>Distracting:</b> {formatTime(data.distractingTime || 0)}
      </p>

      <p><b>🔥 Focus Streak:</b> {data.streak || 0} days</p>

      <hr />

      <h4>Top Sites</h4>
      <ul>
        {Object.entries(data.sites)
          .sort((a, b) => b[1].time - a[1].time)
          .slice(0, 5)
          .map(([site, info]) => (
            <li key={site}>
              {site} ({info.category}) – {formatTime(info.time)}
            </li>
          ))}
      </ul>

      <button
        onClick={() =>
          window.open(
            chrome.runtime.getURL("src/dashboard/dashboard.html")
          )
        }
      >
        Open Dashboard
      </button>
    </div>
  );
}

export default Popup;
