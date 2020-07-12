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
      console.log("request data:", data);
      console.log("sender:", sender);
      if (data.source === 'popup') {
        if (data.event === 'remove') {
          console.log('Remove:', data.key, data.type);
          switch(data.type) {
            case 'local':
              localStorage.removeItem(data.key);
              break;
            case 'session':
              sessionStorage.removeItem(data.key);
              break;
          }
        } else if (data.event === 'edit') {
          console.log('Set:', data.type, data.key, data.value);
          switch(data.type) {
            case 'local':
              localStorage.setItem(data.key, data.value);
              break;
            case 'session':
              sessionStorage.setItem(data.key, data.value);
              break;
          }
        }
      }

    });

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
  window.postMessage({source:'proxy',event:'sync'});
})();
