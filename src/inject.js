(() => {
  // const extensionId = 'giompennnhheakjcnobejbnjgbbkmdnd'; // prod id
  const extensionId = 'edlnliiobjcbbiafjdclellilgfocmmb'; // dev id
  const iframeId = extensionId;
  if (document.getElementById(iframeId)) {
    // console.log('Already injected, skip;');
  } else {
    const getStorage = (type) => {
      let storage, data = {};
      if (type === 'local') {
        storage = window.localStorage;
      } else if (type === 'session') {
        storage = window.sessionStorage;
      } else {
        return {};
      }
      for(let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        data[key] = storage.getItem(key);
      }
      return data;
    };
    const sync = () => {
      const local = getStorage('local');
      const session = getStorage('session');
      return { local, session };
    };
    window.addEventListener("message", ({data}) => {
      if (data.source === 'proxy' && data.event === 'sync') {
        const port = chrome.runtime.connect();
        port.postMessage(sync());
        port.disconnect();
      }
    }, false);

    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.src =`${location.origin}/${extensionId}-proxy.html`;
    iframe.style.display = 'none';
    iframe.onload = function(){
      const fd = iframe.contentWindow.document;
      const fb = fd.body;
      const fs = fd.createElement('script');
      fs.innerHTML =
        `const onchange = (ev) => {window.parent.postMessage({source:'proxy',event:'sync'});};`+
        'window.addEventListener("storage", onchange, false);';
      fb.appendChild(fs);
    }
    document.body.appendChild(iframe);
  }
})();

