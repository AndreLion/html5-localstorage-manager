chrome.runtime.onMessage.addListener(msg => {
  if (msg.source === "popup" && msg.event === "mounted") {
    chrome.tabs.executeScript({
      file: "inject.js"
    });
  }
});
