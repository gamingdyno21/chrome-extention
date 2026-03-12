export function getDefaultGoals() {
  return {
    productiveGoal: 10800,  // 3 hours
    distractingLimit: 3600  // 1 hour
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
