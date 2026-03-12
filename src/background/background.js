// Productivity Tracker Background Service Worker
// Data model (stored per day):
//   storage["2024-01-15"] = {
//     productiveTime: <seconds>,
//     distractingTime: <seconds>,
//     sites: { "github.com": { time: <seconds>, category: "productive" }, … }
//   }
//   storage["timeData"]   = flat cumulative { domain: { time, category } }
//   storage["categories"] = { productive: [], distracting: [], custom: {} }
//   storage["trackingState"] = { currentDomain, startTime, lastPulse }

const DEFAULT_CATEGORIES = {
  productive: [
    "leetcode.com", "github.com", "chat.openai.com", "stackoverflow.com",
    "hackerrank.com", "geeksforgeeks.org", "coursera.org", "udemy.com",
    "notion.so", "docs.google.com"
  ],
  distracting: [
    "youtube.com", "instagram.com", "facebook.com", "twitter.com",
    "x.com", "reddit.com", "tiktok.com", "twitch.tv", "netflix.com"
  ],
  custom: {}
};

// Helpers

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getDomain(url) {
  if (!url) return null;
  if (url.startsWith("chrome://") || url.startsWith("edge://") ||
      url.startsWith("chrome-extension://") || url.startsWith("about:")) {
    return null;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, "");
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

// State Persistence

let isIdle = false;

function getTrackingState(callback) {
  chrome.storage.local.get(["trackingState"], (res) => {
    callback(res.trackingState || { currentDomain: null, startTime: null });
  });
}

function setTrackingState(state) {
  chrome.storage.local.set({ trackingState: state });
}

// Storage processing

const storageQueue = [];
let isProcessingQueue = false;

function processQueue() {
  if (isProcessingQueue || storageQueue.length === 0) return;
  isProcessingQueue = true;

  const { domain, seconds, callback } = storageQueue.shift();
  const todayKey = getTodayKey();

  chrome.storage.local.get(["timeData", "categories", todayKey], (res) => {
    const categories = res.categories || DEFAULT_CATEGORIES;
    const category   = getCategory(domain, categories);

    const timeData = res.timeData || {};
    if (!timeData[domain]) timeData[domain] = { time: 0, category };
    timeData[domain].time += seconds;
    timeData[domain].category = category;

    const dayData = res[todayKey] || { productiveTime: 0, distractingTime: 0, sites: {} };
    if (!dayData.sites[domain]) {
      dayData.sites[domain] = { time: 0, category };
    }
    dayData.sites[domain].time += seconds;
    dayData.sites[domain].category = category;

    if (category === "productive") {
      dayData.productiveTime = (dayData.productiveTime || 0) + seconds;
    } else if (category === "distracting") {
      dayData.distractingTime = (dayData.distractingTime || 0) + seconds;
    }

    chrome.storage.local.set({
      timeData,
      categories,
      [todayKey]: dayData
    }, () => {
      console.log(`[Background] Stored ${seconds}s for ${domain} (${category}). Total today: P:${dayData.productiveTime}s, D:${dayData.distractingTime}s`);
      isProcessingQueue = false;
      if (callback) callback();
      processQueue();
    });
  });
}

function storeTime(domain, seconds, callback) {
  if (!domain || seconds <= 0) {
    if (callback) callback();
    return;
  }
  storageQueue.push({ domain, seconds, callback });
  processQueue();
}

// Tab tracking

function handleSwitch(newUrl) {
  if (isIdle) return;

  const nextDomain = getDomain(newUrl);

  getTrackingState((state) => {
    const { currentDomain, startTime } = state;

    // If we are already tracking this domain, don't reset anything.
    // This prevents losing fractional seconds on frequent history/title updates.
    if (nextDomain === currentDomain && startTime) {
      return;
    }

    const now = Date.now();

    // If we were tracking a domain, save its accumulated time.
    if (currentDomain && startTime) {
      const seconds = Math.floor((now - startTime) / 1000);
      if (seconds > 0) {
        storeTime(currentDomain, seconds);
      }
    }

    // Start tracking the new domain.
    setTrackingState({
      currentDomain: nextDomain,
      startTime: nextDomain ? now : null
    });
  });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!tab || !tab.url) return;
    handleSwitch(tab.url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ((changeInfo.status === "complete" || changeInfo.url) && tab.active) {
    if (!tab.url) return;
    handleSwitch(tab.url);
  }
});

chrome.webNavigation?.onHistoryStateUpdated?.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      if (tab.active) handleSwitch(tab.url);
    });
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus — save current time
    const now = Date.now();
    getTrackingState((state) => {
      const { currentDomain, startTime } = state;
      if (currentDomain && startTime) {
        const seconds = Math.floor((now - startTime) / 1000);
        storeTime(currentDomain, seconds);
        setTrackingState({ currentDomain, startTime: null });
      }
    });
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      handleSwitch(tabs[0].url);
    }
  });
});

// Idle detection
// Watch videos for up to 15 mins without mouse movement
chrome.idle.setDetectionInterval(900); 

chrome.idle.onStateChanged.addListener((state) => {
  if (state === "idle" || state === "locked") {
    isIdle = true;
    const now = Date.now();
    getTrackingState((state) => {
      const { currentDomain, startTime } = state;
      if (currentDomain && startTime) {
        const seconds = Math.floor((now - startTime) / 1000);
        storeTime(currentDomain, seconds);
        setTrackingState({ currentDomain, startTime: null });
      }
    });
  } else {
    isIdle = false;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const nextDomain = getDomain(tabs[0].url);
        setTrackingState({
          currentDomain: nextDomain,
          startTime: nextDomain ? Date.now() : null
        });
      }
    });
  }
});

// Pulse heartbeat

chrome.alarms.create("heartbeat", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "heartbeat" && !isIdle) {
    pulse();
  }
});

function pulse(callback) {
  const now = Date.now();
  getTrackingState((state) => {
    const { currentDomain, startTime } = state;
    if (currentDomain && startTime) {
      const seconds = Math.floor((now - startTime) / 1000);
      storeTime(currentDomain, seconds, () => {
        // Reset start time to now so we only track the increment next time
        setTrackingState({ currentDomain, startTime: now });
        if (callback) callback();
      });
    } else if (callback) {
      callback();
    }
  });
}

// Listeners

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FLUSH_TIME") {
    pulse(() => sendResponse({ status: "flushed" }));
    return true; // Keep channel open for async response
  }
});
