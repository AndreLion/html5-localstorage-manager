window.onmessage = function(e){
	chrome.runtime.sendMessage({source:'notification',event:'refresh'});
};
