let activeTabId = null;
let activeDomain = null;
let startTime = null;

const PRODUCTIVE_SITES = [
  "github.com",
  "chatgpt.com",
  "leetcode.com",
  "hackerrank.com"
];

function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

function getCategory(domain) {
  if (!domain) return "neutral";
  return PRODUCTIVE_SITES.some((site) => domain.includes(site))
    ? "productive"
    : "distracting";
}

function saveTime(domain, duration) {
  const today = new Date().toISOString().split("T")[0];
  const category = getCategory(domain);

  chrome.storage.local.get([today], (res) => {
    const data = res[today] || {
      totalTime: 0,
      productiveTime: 0,
      distractingTime: 0,
      sites: {}
    };

    data.totalTime += duration;

    if (category === "productive") {
      data.productiveTime += duration;
    } else if (category === "distracting") {
      data.distractingTime += duration;
    }

    if (!data.sites[domain]) {
      data.sites[domain] = {
        time: 0,
        category
      };
    }

    data.sites[domain].time += duration;

    chrome.storage.local.set({ [today]: data });
  });
}

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

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url) handleChange(tabId, tab.url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    handleChange(tabId, changeInfo.url);
  }
});
