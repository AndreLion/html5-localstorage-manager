window.onmessage = function(e){
	console.log('notification: changed');
	chrome.runtime.sendMessage({source:'notification',event:'refresh'});
};

