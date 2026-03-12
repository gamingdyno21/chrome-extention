import React, { useEffect, useState } from "react";
import { formatSeconds, getTodayKey } from "../utils/timeTracker";
import { loadGoals, saveGoals, getDefaultGoals } from "../utils/goals";

function GoalsPanel() {
  const [goals, setGoals] = useState(getDefaultGoals());
  const [today, setToday] = useState({ productiveTime: 0, distractingTime: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const todayKey = getTodayKey();
    chrome.storage.local.get(["goals", todayKey], (res) => {
      if (res.goals) setGoals(res.goals);
      const day = res[todayKey] || {};
      setToday({ productiveTime: day.productiveTime || 0, distractingTime: day.distractingTime || 0 });
    });
  }, []);

  function handleSave() {
    saveGoals(goals, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const prodPct = Math.min(100, Math.round((today.productiveTime / goals.productiveGoal) * 100));
  const distPct = Math.min(100, Math.round((today.distractingTime / goals.distractingLimit) * 100));
  const prodClass = prodPct >= 100 ? "good" : prodPct >= 50 ? "warn" : "bad";
  const distClass = distPct >= 100 ? "bad" : distPct >= 70 ? "warn" : "good";

  return (
    <div className="card">
      <h3>🎯 Daily Goals</h3>

      {/* Progress vs today */}
      <div style={{ marginBottom: 20 }}>
        <div className="goal-progress-row">
          <span>Productive: {formatSeconds(today.productiveTime)}</span>
          <span style={{ color: "var(--text-sub)" }}>
            Goal: {formatSeconds(goals.productiveGoal)} ({prodPct}%)
          </span>
        </div>
        <div className="goal-track">
          <div className={`goal-fill ${prodClass}`} style={{ width: `${prodPct}%` }} />
        </div>

        <div className="goal-progress-row">
          <span>Distracting: {formatSeconds(today.distractingTime)}</span>
          <span style={{ color: "var(--text-sub)" }}>
            Limit: {formatSeconds(goals.distractingLimit)} ({distPct}%)
          </span>
        </div>
        <div className="goal-track">
          <div className={`goal-fill ${distClass}`} style={{ width: `${distPct}%` }} />
        </div>
      </div>

      {/* Edit goals */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: "var(--text-sub)" }}>
          Edit Goals
        </div>
        <div className="goals-grid">
          <div className="goal-item">
            <label>Productive goal (minutes)</label>
            <input
              type="number"
              min="1"
              value={Math.round(goals.productiveGoal / 60)}
              onChange={(e) =>
                setGoals((g) => ({ ...g, productiveGoal: Math.max(1, Number(e.target.value)) * 60 }))
              }
            />
          </div>
          <div className="goal-item">
            <label>Distraction limit (minutes)</label>
            <input
              type="number"
              min="1"
              value={Math.round(goals.distractingLimit / 60)}
              onChange={(e) =>
                setGoals((g) => ({ ...g, distractingLimit: Math.max(1, Number(e.target.value)) * 60 }))
              }
            />
          </div>
        </div>

        <button className="save-btn" onClick={handleSave}>
          {saved ? "✅ Saved!" : "Save Goals"}
        </button>
      </div>
    </div>
  );
}

export default GoalsPanel;
