let activeTabId = null;
let activeDomain = null;
let startTime = null;

// -----------------------------
// Site classification
// -----------------------------
function classifySite(domain) {
  const productiveSites = [
    "leetcode.com",
    "github.com",
    "hackerrank.com",
    "geeksforgeeks.org",
    "stackoverflow.com"
  ];

  const distractingSites = [
    "youtube.com",
    "instagram.com",
    "facebook.com",
    "twitter.com"
  ];

  if (productiveSites.includes(domain)) return "productive";
  if (distractingSites.includes(domain)) return "distracting";
  return "neutral";
}

// -----------------------------
// Extract domain name
// -----------------------------
function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

// -----------------------------
// Save time data
// -----------------------------
function saveTime(domain, duration) {
  if (!domain || duration <= 0) return;

  const today = new Date().toISOString().split("T")[0];
  const category = classifySite(domain);

  chrome.storage.local.get([today], (result) => {
    const data = result[today] || {
      totalTime: 0,
      productiveTime: 0,
      distractingTime: 0,
      neutralTime: 0,
      sites: {}
    };

    data.totalTime += duration;

    if (!data.sites[domain]) {
      data.sites[domain] = {
        time: 0,
        category
      };
    }

    data.sites[domain].time += duration;

    if (category === "productive") data.productiveTime += duration;
    else if (category === "distracting") data.distractingTime += duration;
    else data.neutralTime += duration;

    chrome.storage.local.set({ [today]: data });
  });
}

// -----------------------------
// Handle tab change
// -----------------------------
function handleChange(tabId, url) {
  const now = Date.now();

  if (activeDomain && startTime) {
    const duration = Math.floor((now - startTime) / 1000);
    saveTime(activeDomain, duration);
  }

  activeTabId = tabId;
  activeDomain = getDomain(url);
  startTime = now;
}

// -----------------------------
// Tab activated
// -----------------------------
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url) handleChange(tabId, tab.url);
  });
});

// -----------------------------
// Tab updated (URL change)
// -----------------------------
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    handleChange(tabId, changeInfo.url);
  }
});
