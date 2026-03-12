# ⏱ Productivity Time Tracker

A Chrome Extension built with React + Vite that tracks how you spend time on the web — and helps you spend it better.

---

## 🔴 Problem Statement

> **"Most people have no idea how much time they actually waste online — and no easy way to find out."**

### The Core Problems

1. **Invisible Time Loss**
   Browsing feels productive, but hours slip away on YouTube, Instagram, or Reddit without you realizing it. There is no native browser feature that shows you where your time actually goes.

2. **No Daily Awareness**
   Without data, you can't change behavior. People set goals like *"spend more time coding"* but have no feedback loop to know if they're succeeding or failing on any given day.

3. **No Personalization**
   Every person's definition of "productive" is different. A data analyst might use YouTube tutorials productively. A student might use Reddit for research. Generic site blockers don't account for context.

4. **No Weekly Trends**
   Single-day snapshots are misleading. You need to see patterns over days and weeks to understand your real habits — are you actually getting better over time?

5. **No Accountability System**
   Goals without tracking are just wishes. You need both a target *and* a way to see how close you are to hitting it each day.

---

## ✅ Solution

The **Productivity Time Tracker** Chrome Extension solves all of the above with a lightweight, always-on system:

### How It Solves Each Problem

| Problem | Solution |
|---------|----------|
| Invisible time loss | A background service worker silently records every second spent on every domain — no manual input needed |
| No daily awareness | The popup shows today's productive & distracting time at a glance the moment you click the icon |
| No personalization | You can override any site's category (✅ Productive / ➖ Neutral / ⛔ Distracting) directly from the popup with one click |
| No weekly trends | The Dashboard's Week tab shows a grouped bar chart of productive vs. distracting time for each of the last 7 days |
| No accountability | The Goals tab lets you set a daily productive target and distraction limit — with color-coded progress bars showing exactly where you stand |

---

## 🏗️ Architecture Overview

```
Chrome Extension (Manifest V3)
│
├── background.js        ← Always-running service worker
│   └── Tracks active tab time, stores data by date in chrome.storage
│
├── Popup (React)        ← Quick glance UI (click the toolbar icon)
│   ├── Today's stats    ← Productive / Distracting time
│   ├── Goal progress    ← How close to your daily targets
│   └── Site category    ← Override any site's classification
│
└── Dashboard (React)    ← Full analytics (opens as a Chrome tab)
    ├── Today tab        ← Donut chart + per-site time breakdown
    ├── Week tab         ← 7-day bar chart + top sites
    └── Goals tab        ← Set & track daily goals
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Extension Platform | Chrome Manifest V3 |
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| Charts | Recharts |
| Persistent Storage | `chrome.storage.local` |
| Styling | Vanilla CSS (glassmorphism dark theme) |

---

## 📊 Data Model

All tracking data is stored locally on your machine — no servers, no accounts, no privacy concerns.

```js
// Per-day record (one key per calendar date)
chrome.storage.local["2024-01-15"] = {
  productiveTime:  7200,   // seconds
  distractingTime: 1800,   // seconds
  sites: {
    "github.com":  { time: 5400, category: "productive" },
    "youtube.com": { time: 1800, category: "distracting" }
  }
}

// User's category preferences (persisted across sessions)
chrome.storage.local.categories = {
  productive:  ["github.com", "leetcode.com", ...],
  distracting: ["youtube.com", "instagram.com", ...],
  custom:      { "notion.so": "productive" }
}

// Daily goals
chrome.storage.local.goals = {
  productiveGoal:   10800,  // 3 hours
  distractingLimit:  3600   // 1 hour
}
```

---

## 🚀 Getting Started

### Install (Development)
```bash
git clone <repo-url>
cd productivity-time-tracker
npm install
npm run build
```

### Load in Chrome
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `dist/` folder
4. The extension icon appears in your toolbar

### Usage
- **Click the icon** → see today's stats and current site category
- **Override a category** → click Productive / Neutral / Distracting
- **Open Full Dashboard** → click the green button in the popup
- **Set your goals** → go to the Goals tab in the dashboard

---

## 📁 Project Structure

```
productivity-time-tracker/
├── manifest.json          ← Chrome extension config
├── popup.html             ← Popup entry point
├── dashboard.html         ← Dashboard entry point
├── vite.config.js         ← Build config
├── src/
│   ├── background/        ← Service worker (time tracking logic)
│   ├── popup/             ← Popup React app
│   ├── dashboard/         ← Dashboard React app (charts + goals)
│   ├── utils/             ← Shared helpers (formatting, storage, goals)
│   └── styles/            ← Theme CSS variables
└── dist/                  ← Built output → load this into Chrome
```
