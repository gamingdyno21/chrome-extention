export function getLatestData(callback) {
  chrome.storage.local.get(null, (result) => {
    const dates = Object.keys(result);

    if (dates.length === 0) {
      callback(null);
      return;
    }

    const latestDate = dates.sort().pop();
    callback({ date: latestDate, data: result[latestDate] });
  });
}
