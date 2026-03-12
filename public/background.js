let currentDomain = null;
let startTime = null;

const DEFAULT_CATEGORIES = {
  productive: ["leetcode.com", "github.com", "chat.openai.com"],
  distracting: ["youtube.com", "instagram.com", "facebook.com"],
  custom: {}
};

function getDomain(url) {
  if (!url) return null;
  if (url.startsWith("chrome://") || url.startsWith("edge://")) return null;

  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

function getCategory(domain, categories) {
  if (!domain) return "neutral";

  if (categories.productive.includes(domain)) return "productive";
  if (categories.distracting.includes(domain)) return "distracting";
  if (categories.custom && categories.custom[domain]) return categories.custom[domain];

  return "neutral";
}

function storeTime(domain, seconds) {
  if (!domain || seconds <= 0) return;

  chrome.storage.local.get(["timeData", "categories"], (res) => {
    const data = res.timeData || {};
    const categories = res.categories || DEFAULT_CATEGORIES;

    const category = getCategory(domain, categories);

    if (!data[domain]) {
      data[domain] = { time: 0, category };
    }

    data[domain].time += seconds;
    data[domain].category = category;

    chrome.storage.local.set({
      timeData: data,
      categories: categories
    });
  });
}

function handleSwitch(newUrl) {
  const now = Date.now();

  if (currentDomain && startTime) {
    const seconds = Math.floor((now - startTime) / 1000);
    storeTime(currentDomain, seconds);
  }

  currentDomain = getDomain(newUrl);
  startTime = Date.now();
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!tab || !tab.url) return;
    handleSwitch(tab.url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    if (!tab.url) return;
    handleSwitch(tab.url);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      handleSwitch(tabs[0].url);
    }
  });
});
