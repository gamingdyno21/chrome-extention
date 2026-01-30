export const PRODUCTIVE_SITES = [
  "leetcode.com",
  "github.com",
  "stackoverflow.com",
  "hackerrank.com",
  "geeksforgeeks.org"
];

export const DISTRACTING_SITES = [
  "youtube.com",
  "instagram.com",
  "facebook.com",
  "twitter.com"
];

export function classifySite(domain) {
  if (PRODUCTIVE_SITES.includes(domain)) return "productive";
  if (DISTRACTING_SITES.includes(domain)) return "distracting";
  return "neutral";
}
