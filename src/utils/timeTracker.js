// Helper for date keys, e.g. "2024-01-15"
export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

// Get last N days including today
export function getRecentKeys(n = 7) {
  const keys = [];
  const date  = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(date);
    d.setDate(date.getDate() - i);
    keys.push(d.toISOString().split("T")[0]);
  }
  return keys;
}

// Convert seconds to readable format (1h 23m)
export function formatSeconds(totalSeconds) {
  if (!totalSeconds || totalSeconds < 60) return "< 1m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Seconds to minutes conversion
export function toMinutes(s) {
  return Math.round((s || 0) / 60);
}

// Day of week label (Mon, Tue...)
export function dayLabel(isoKey) {
  const [y, mo, d] = isoKey.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}
