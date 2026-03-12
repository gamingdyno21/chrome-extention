import { useEffect, useState } from "react";
import "./popup.css";
import { formatSeconds } from "../utils/timeTracker";

function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
}

export default function Popup() {
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("neutral");
  const [todayStats, setTodayStats] = useState({ productive: 0, distracting: 0 });
  const [goals, setGoals] = useState({ productiveGoal: 10800, distractingLimit: 3600 });
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // data loading
  useEffect(() => {
    const loadData = () => {
      const todayKey = new Date().toISOString().split("T")[0];

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.url) return;

        let d = "";
        try { d = new URL(tabs[0].url).hostname.replace(/^www\./, ""); } catch { return; }
        setDomain(d);

        chrome.storage.local.get(["categories", "goals", todayKey], (res) => {
          const cats = res.categories || { productive: [], distracting: [], custom: {} };
          if (cats.productive.includes(d))        setCategory("productive");
          else if (cats.distracting.includes(d))  setCategory("distracting");
          else if (cats.custom?.[d])              setCategory(cats.custom[d]);
          else                                    setCategory("neutral");

          if (res.goals) setGoals(res.goals);

          const day = res[todayKey] || {};
          setTodayStats({
            productive:  day.productiveTime  || 0,
            distracting: day.distractingTime || 0
          });
        });
      });
    };

    // flush time from bg
    chrome.runtime.sendMessage({ type: "FLUSH_TIME" }, () => {
      loadData();
    });

    // 5s refresh
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  function updateCategory(newCat) {
    chrome.storage.local.get("categories", (res) => {
      let cats = res.categories || { productive: [], distracting: [], custom: {} };
      cats.productive  = cats.productive.filter((s) => s !== domain);
      cats.distracting = cats.distracting.filter((s) => s !== domain);
      delete cats.custom[domain];

      if (newCat === "productive")  cats.productive.push(domain);
      else if (newCat === "distracting") cats.distracting.push(domain);
      else if (newCat !== "neutral") cats.custom[domain] = newCat;

      chrome.storage.local.set({ categories: cats });
      setCategory(newCat);
    });
  }

  // Goal progress
  const productivePct = Math.min(100, Math.round((todayStats.productive  / goals.productiveGoal)   * 100));
  const distractPct   = Math.min(100, Math.round((todayStats.distracting / goals.distractingLimit) * 100));
  const fillClass     = productivePct >= 100 ? "good" : productivePct >= 50 ? "warn" : "bad";
  const distFillClass = distractPct  >= 100 ? "bad"  : distractPct  >= 70  ? "warn" : "good";

  return (
    <>
      {/* Header */}
      <div className="popup-header">
        <div className="logo">
          <span>⏱</span> Productivity Tracker
        </div>
        <button className="theme-btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Today summary */}
      <div className="summary">
        <div className="stat-box productive">
          <div className="label">Productive</div>
          <div className="value">{formatSeconds(todayStats.productive)}</div>
        </div>
        <div className="stat-box distracting">
          <div className="label">Distracting</div>
          <div className="value">{formatSeconds(todayStats.distracting)}</div>
        </div>
      </div>

      {/* Goal progress bars */}
      <div className="goal-section">
        <div className="goal-label">
          <span>Daily productive goal</span>
          <span>{productivePct}%</span>
        </div>
        <div className="progress-track">
          <div className={`progress-fill ${fillClass}`} style={{ width: `${productivePct}%` }} />
        </div>
      </div>
      <div className="goal-section" style={{ paddingTop: 6 }}>
        <div className="goal-label">
          <span>Distraction limit used</span>
          <span>{distractPct}%</span>
        </div>
        <div className="progress-track">
          <div className={`progress-fill ${distFillClass}`} style={{ width: `${distractPct}%` }} />
        </div>
      </div>

      {/* Current site */}
      <div className="current-site">
        <div className="section-title">Current Site</div>
        <div className="site-row">
          {domain
            ? <><span className="site-domain">{domain}</span><span className={`badge ${category}`}>{category}</span></>
            : <span className="no-site">No active website</span>
          }
        </div>
      </div>

      {/* Category buttons */}
      {domain && (
        <div className="actions">
          {["productive", "neutral", "distracting"].map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? `active ${cat}` : ""}`}
              onClick={() => updateCategory(cat)}
            >
              {cat === "productive" ? "✅" : cat === "distracting" ? "⛔" : "➖"}
              {" "}{cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Dashboard link */}
      <button className="dashboard-btn" onClick={openDashboard}>
        📊 Open Full Dashboard
      </button>
    </>
  );
}
