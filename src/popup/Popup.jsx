import React, { useEffect, useState } from "react";
import { getLatestData } from "../utils/storage";

function Popup() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getLatestData(setInfo);
  }, []);

  if (!info) return <p style={{ padding: 10 }}>No data yet</p>;

  const { date, data } = info;

  return (
    <div style={{ padding: 10, width: 260 }}>
      <h3>{date}</h3>
      <p>Total Time: {Math.floor(data.totalTime / 60)} min</p>

      <h4>Top Sites</h4>
      <ul>
        {Object.entries(data.sites)
          .sort((a, b) => b[1].time - a[1].time)
          .slice(0, 5)
          .map(([site, info]) => (
            <li key={site}>
              {site}: {Math.floor(info.time / 60)} min
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Popup;
