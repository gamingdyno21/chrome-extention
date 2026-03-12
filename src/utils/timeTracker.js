/**
 * Utility helpers for time formatting and date key generation.
 */

/** Returns today's ISO date string, e.g. "2024-01-15" */
export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns the last N date strings (ISO) ending with today.
 * @param {number} n - number of days
 * @returns {string[]}
 */
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

/**
 * Formats a number of seconds into a human-readable string.
 * @param {number} totalSeconds
 * @returns {string} e.g. "1h 23m" or "45m" or "< 1m"
 */
export function formatSeconds(totalSeconds) {
  if (!totalSeconds || totalSeconds < 60) return "< 1m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Formats seconds into minutes (rounded).
 * @param {number} s
 * @returns {number}
 */
export function toMinutes(s) {
  return Math.round((s || 0) / 60);
}

/**
 * Returns the short day label for a date string, e.g. "Mon".
 * @param {string} isoKey - "2024-01-15"
 * @returns {string}
 */
export function dayLabel(isoKey) {
  const [y, mo, d] = isoKey.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}
