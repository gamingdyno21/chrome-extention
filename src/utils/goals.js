export function getDefaultGoals() {
  return {
    productiveGoal: 180,   // 3 hours
    distractingLimit: 60  // 1 hour
  };
}

export function loadGoals(callback) {
  chrome.storage.local.get(["goals"], (res) => {
    callback(res.goals || getDefaultGoals());
  });
}

export function saveGoals(goals, callback) {
  chrome.storage.local.set({ goals }, callback);
}
