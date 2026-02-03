import React, { useEffect, useState } from "react";

function TrendGraph() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      const dates = Object.keys(data).sort().slice(-7);

      const values = dates.map((d) => {
        const day = data[d] || {};
        return (
          (day.productiveTime || 0) -
          (day.distractingTime || 0)
        );
      });

      setPoints(values);
    });
  }, []);

  if (points.length === 0) {
    return <p className="muted">No trend data yet</p>;
  }

  const max = Math.max(...points, 1);
  const min = Math.min(...points, -1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", height: 60 }}>
      {points.map((val, i) => {
        const height =
          ((val - min) / (max - min || 1)) * 50 + 10;

        return (
          <div
            key={i}
            style={{
              width: 12,
              height,
              marginRight: 6,
              background: val >= 0 ? "#4caf50" : "#f44336",
              borderRadius: 4
            }}
          />
        );
      })}
    </div>
  );
}

export default TrendGraph;
