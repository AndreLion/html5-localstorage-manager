chrome.runtime.onMessage.addListener(msg => {
  if (msg.source === "popup" && msg.event === "mounted") {
    chrome.tabs.executeScript({
      file: "vendor/js.cookie.min.js"
    }, () => {
      chrome.tabs.executeScript({
        file: "inject.js"
      });
    });
  }
});
