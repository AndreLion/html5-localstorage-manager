(() => {
  // const extensionId = 'giompennnhheakjcnobejbnjgbbkmdnd'; // prod id
  const extensionId = "edlnliiobjcbbiafjdclellilgfocmmb"; // dev id
  const iframeId = extensionId;
  const getStorage = type => {
    let storage,
      data = [];
    if (type === "local") {
      storage = window.localStorage;
    } else if (type === "session") {
      storage = window.sessionStorage;
    } else {
      return [];
    }
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      data.push({
        key,
        value: storage.getItem(key)
      });
    }
    return data;
  };
  if (!document.getElementById(iframeId)) {
    window.addEventListener(
      "message",
      ({ data }) => {
        if (data.source === "proxy" && data.event === "sync") {
          const port = chrome.runtime.connect();
          port.postMessage({
            origin: location.origin,
            local: getStorage("local"),
            session: getStorage("session")
          });
          port.disconnect();
        }
      },
      false
    );

    chrome.runtime.onMessage.addListener((data, sender) => {
      if(sender.id !== extensionId) {
        return ;
      }
      if (data.source === 'popup') {
        if (data.event === 'remove') {
          switch(data.type) {
            case 'local':
              localStorage.removeItem(data.key);
              break;
            case 'session':
              sessionStorage.removeItem(data.key);
              break;
          }
        } else if (data.event === 'edit') {
          switch(data.type) {
            case 'local':
              localStorage.setItem(data.key, data.value);
              break;
            case 'session':
              sessionStorage.setItem(data.key, data.value);
              break;
          }
        } else if (data.event === 'add') {
          switch(data.type) {
            case 'local':
              localStorage.setItem(data.key, data.value);
              break;
            case 'session':
              sessionStorage.setItem(data.key, data.value);
              break;
          }
        } else if (data.event === 'popup2') {
          const winPopup = window.open(
            `/${extensionId}-popup2.html`,
            'storagemanager',
            'toolbar=yes, scrollbars=yes, resizable=yes, width=600, height=500'
          );
          winPopup.onload = () => {
            winPopup.document.write(
              `<style>*{padding:0;margin:0;}</style>` +
              `<iframe id="${extensionId}-popup2" style="height:100%;width:100%;" frameBorder="0" src="chrome-extension://edlnliiobjcbbiafjdclellilgfocmmb/popup.html#popup2"></iframe>`
            );
          };
        }
      }
    });

    if (!document.getElementById(`${iframeId}-popup2`)) {
      const iframe = document.createElement("iframe");
      iframe.id = iframeId;
      iframe.src = `${location.origin}/${extensionId}-proxy.html`;
      iframe.style.display = "none";
      iframe.onload = () => {
        const fd = iframe.contentWindow.document;
        const fb = fd.body;
        const fs = fd.createElement("script");
        fs.innerHTML =
          `const onchange = (ev) => {window.parent.postMessage({source:'proxy',event:'sync'});};` +
          'window.addEventListener("storage", onchange, false);';
        fb.appendChild(fs);
      };
      document.body.appendChild(iframe);
    }
  }
  window.postMessage({source:'proxy',event:'sync'});
})();
