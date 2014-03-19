//background.js

function update(tabId) {
	chrome.tabs.sendMessage(tabId, {source:'background',event:'init'}, function (len) {
		chrome.storage.sync.get('alwaysShowIcon',function(obj){
			var alwaysShowIcon = obj.alwaysShowIcon;
			if(alwaysShowIcon || len){
				chrome.pageAction.show(tabId);
			}
		});
	});
}

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    if (change.status == "complete") {
        update(tabId);
    }
});


// Ensure the current selected tab is set up.
chrome.tabs.query({
    active: true,
    currentWindow: true
}, function (tabs) {
    update(tabs[0].id);
});

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.source === 'notification'){
		if(message.event === 'refresh'){
			chrome.tabs.query({active: true,currentWindow: true}, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id,{source:'background',event:'refresh'});
			});
		}
	}
});
