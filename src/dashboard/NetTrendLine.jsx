import React, { useEffect, useState } from "react";

function NetTrendLine() {
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
    return <p className="muted">No trend data</p>;
  }

  const max = Math.max(...points, 1);
  const min = Math.min(...points, -1);
  const range = max - min || 1;

  const width = 320;
  const height = 100;
  const padding = 10;

  const baselineY =
    padding +
    (max / range) * (height - padding * 2);

  const path = points
    .map((val, i) => {
      const x =
        padding +
        (i / (points.length - 1 || 1)) *
          (width - padding * 2);

      const y =
        padding +
        ((max - val) / range) *
          (height - padding * 2);

      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height}>
      {/* baseline */}
      <line
        x1="0"
        y1={baselineY}
        x2={width}
        y2={baselineY}
        stroke="#333"
        strokeDasharray="4"
      />

      {/* net P/L line */}
      <path
        d={path}
        fill="none"
        stroke={
          points[points.length - 1] >= 0
            ? "#4caf50"
            : "#f44336"
        }
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default NetTrendLine;
