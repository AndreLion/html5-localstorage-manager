var store = localStorage;
var inited = false;
var init = function(){
	var body = document.getElementsByTagName('body')[0];
	var iframe = document.createElement('iframe');
	var url404 = location.origin+'/chrome-extension-localstorage-manager-iframe-notification-404.html';
	iframe.src = url404;
	iframe.style.display = 'none';
	iframe.onload = function(ev){
		var fd = iframe.contentWindow.document;
		var fb = fd.getElementsByTagName('body')[0];
		var fs = fd.createElement('script');
		fs.innerHTML = ''+
			'var onchange = function(ev){document.getElementById("iframe").contentWindow.postMessage(\'changed\',\'chrome-extension://jkofiajodjfeakdgakfhhfnfmbohpogg\')};'+
			'window.addEventListener("storage", onchange, false);';
		fb.appendChild(fs);

		var ff = fd.createElement('iframe');
		ff.id = 'iframe';
		//ff.onload = 'javascript:onchange();';
		ff.src = 'chrome-extension://jkofiajodjfeakdgakfhhfnfmbohpogg/notification.html';
		fb.appendChild(ff);
	}
	body.appendChild(iframe);		
	inited = true;
};

var dump = function(){
	var result = {};
	for(var i=0,l=store.length;i<l;i++){
		var key = store.key(i);
		var value = store.getItem(key);
		result[key] = value;
	}
	return result;
};

var refresh = function(){
	chrome.runtime.sendMessage({source:'content',event:'sync',data:dump()});
};

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.source === 'popup'){
		if(message.event === 'onload'){
			if(!inited){
				init();
			}
		}else if(message.event  === 'pull'){
			sendResponse(dump());
		}else if(message.event  === 'clear'){
			store.clear();
			sendResponse(dump());
		}else if(message.event  === 'remove'){
			store.removeItem(message.data.key);
			sendResponse(dump());
		}else if(message.event  === 'add'){
			store.setItem(message.data.key,message.data.value);
			sendResponse(dump());
		}
	}else if(message.source === 'background'){
		if(message.event === 'init'){
			sendResponse(localStorage.length);
		}else if(message.event === 'refresh'){
			refresh();
		}
	}
});


