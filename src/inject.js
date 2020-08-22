(() => {
  // const extensionId = 'giompennnhheakjcnobejbnjgbbkmdnd'; // prod id
  const extensionId = "edlnliiobjcbbiafjdclellilgfocmmb"; // dev id
  let origin = "";
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
  const getCookie = () => {
    const cookies = Cookies.get();
    return Object.keys(cookies).map(key => ({
      key,
      value: cookies[key]
    }));
  };
  if (!document.getElementById(extensionId)) {
    window.addEventListener(
      "message",
      ({ data }) => {
        const port = chrome.runtime.connect();
        if (data.source === "proxy" && data.event === "syncStorage") {
          port.postMessage({
            origin: location.origin,
            local: getStorage("local"),
            session: getStorage("session"),
            timestamp: Date.now()
          });
        } else if (data.source === "proxy" && data.event === "syncCookie") {
          port.postMessage({
            origin: location.origin,
            cookie: getCookie(),
            timestamp: Date.now()
          });
        }
        port.disconnect();
        origin = location.origin;
      },
      false
    );

    chrome.runtime.onMessage.addListener((data, sender) => {
      if(sender.id !== extensionId) {
        return ;
      }
      console.log("onMessage", data);
      if (data.source === 'popup') {
        if (data.event === 'remove') {
          switch(data.type) {
            case 'local':
              localStorage.removeItem(data.key);
              break;
            case 'session':
              sessionStorage.removeItem(data.key);
              break;
            case 'cookie':
              Cookies.remove(data.key);
              break;
          }
        } else if (data.event === 'removeAll') {
          switch(data.type) {
            case 'local':
              localStorage.clear();
              break;
            case 'session':
              sessionStorage.clear();
              break;
            case 'cookie':
              Object.keys(Cookies.get()).forEach(key => {
                Cookies.remove(key);
              })
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
            case 'cookie':
              Cookies.set(data.key, data.value);
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
            case 'cookie':
              Cookies.set(data.key, data.value);
              break;
          }
        } else if (data.event === 'popup2') {
          const tabId = data.tabId;
          const winPopup = window.open(
            `/${extensionId}-popup2.html`,
            extensionId,
            'toolbar=yes, scrollbars=yes, resizable=yes, width=640, height=600'
          );
          setTimeout(() => {
            winPopup.document.open();
            winPopup.document.write(
              `<style>*{padding:0;margin:0;}</style>` +
              `<iframe ` +
              `id="${extensionId}-popup2" ` +
              `style="position:absolute;top:0;left:0;z-index:99999;height:100%;width:100%;" ` +
              `frameBorder="0" ` +
              `src="chrome-extension://${extensionId}/popup.html#popup2|${origin}|${tabId}"` +
              `></iframe>`
            );
            winPopup.document.close();
          }, 1400);
        }
      } else if (data.source === 'popup2') {
        if (data.event === 'syncStorage') {
          window.postMessage({source: 'proxy', event: 'syncStorage'}, location.origin);
        }
      }
    });

    if (!document.getElementById(`${extensionId}-popup2`)) {
      const iframe = document.createElement("iframe");
      iframe.id = extensionId;
      iframe.src = `${location.origin}/${extensionId}-proxy.html`;
      iframe.style.display = "none";
      iframe.onload = () => {
        try {
          const fd = iframe.contentWindow.document;
          const script =
            '<script>' +
            `const onchange = () => {` +
            `window.parent.postMessage({source: 'proxy', event: 'syncStorage', origin: location.origin}, location.origin);` +
            `};` +
            'window.addEventListener("storage", onchange, false);' +
            '</script>';
          fd.write(script);
        } catch (e) {
          setInterval(() => {
            window.postMessage({source: 'proxy', event: 'syncStorage', origin: location.origin}, location.origin);
          }, 1000);
        }
      };
      document.body.appendChild(iframe);
      setInterval(() => {
        window.postMessage({source: 'proxy', event: 'syncCookie', origin: location.origin}, location.origin);
      }, 1000);
    }
  }
  window.postMessage({source: 'proxy', event: 'syncStorage'}, location.origin);
  window.postMessage({source: 'proxy', event: 'syncCookie'}, location.origin);
})();
