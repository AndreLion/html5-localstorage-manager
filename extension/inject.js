var local = localStorage;
var session = sessionStorage;
var inited = false;
//var extensionid = 'giompennnhheakjcnobejbnjgbbkmdnd'; //online
var extensionid = 'kmclokmeccmafganmdhcodpgdobjmklk'; //offline
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
			'var onchange = function(ev){document.getElementById("iframe").contentWindow.postMessage(\'changed\',\'chrome-extension://'+extensionid+'\')};'+
			'window.addEventListener("storage", onchange, false);';
		fb.appendChild(fs);

		var ff = fd.createElement('iframe');
		ff.id = 'iframe';
		ff.src = 'chrome-extension://'+extensionid+'/notification.html';
		fb.appendChild(ff);
	}
	body.appendChild(iframe);		
	inited = true;
};

var dump = function(){
    var len = 0,
        limit = 2621440,
        result = {
            storage:[],
            percentage:0
        },
        key,value,obj;

	for(var i=0,l=local.length;i<l;i++){
		key = local.key(i);
		value = local.getItem(key);
        obj = {
            key:key,
            value:value,
            isJson:false,
            expand:false
        };
        try{
            JSON.parse(value);
            obj.isJson = true;
        }catch(e){}
        result.storage.push(obj);
        len += key.length;
        len += value.length;
	}
    result.percentage = (len/limit*100).toFixed(2);

	return result;
};

var dumpSession = function(){
    var result = [],
        key,value,obj;

	for(var i=0,l=session.length;i<l;i++){
		key = session.key(i);
		value = session.getItem(key);
        obj = {
            key:key,
            value:value,
            isJson:false,
            expand:false
        };
        try{
            JSON.parse(value);
            obj.isJson = true;
        }catch(e){}
        result.push(obj);
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
		}else if(message.event  === 'pullSession'){
			sendResponse(dumpSession());
		}else if(message.event  === 'pullCookie'){
			sendResponse(document.cookie);
		}else if(message.event  === 'clear'){
			local.clear();
			sendResponse(dump());
		}else if(message.event  === 'clearSession'){
			session.clear();
			sendResponse(dumpSession());
		}else if(message.event  === 'remove'){
			local.removeItem(message.data.key);
			sendResponse(dump());
		}else if(message.event  === 'removeSession'){
			session.removeItem(message.data.key);
			sendResponse(dumpSession());
		}else if(message.event  === 'add'){
			local.setItem(message.data.key,message.data.value);
			sendResponse(dump());
		}else if(message.event  === 'addSession'){
			session.setItem(message.data.key,message.data.value);
			sendResponse(dumpSession());
		}else if(message.event  === 'dump'){
			console.log('HTML5 Storage Manager dump JSON of key \''+message.data.key+'\' :');
			console.dir(JSON.parse(message.data.value));
		}else if(message.event  === 'popup'){
			winPopup = window.open("/chrome-extension-localstorage-manager-popup-404.html","storagemanager","toolbar=yes, scrollbars=yes, resizable=yes, width=580, height=600");
			winPopup.onload = function(ev){
				winPopup.document.write(popupHTML);
				//winPopup.document.write('<script src="chrome-extension://'+extensionid+'/lib/jquery-1.10.2.min.js"></script>')
			};
		}
	}else if(message.source === 'background'){
		if(message.event === 'init'){
			sendResponse(localStorage.length);
		}else if(message.event === 'refresh'){
			refresh();
		}
	}
});

var popupHTML = ''
+''
+'			<link rel="stylesheet" href="chrome-extension://'+extensionid+'/lib/bootstrap.min.css" />'
+'			<link rel="stylesheet" href="chrome-extension://'+extensionid+'/localstorage.css" />'
+'			<link rel="stylesheet" href="chrome-extension://'+extensionid+'/popup.css" />'
+'			<form class="form-inline native" role="form">'
+'			  <div class="form-group">'
+'				<input id="key" class="form-control input-sm" type="text" placeholder="Key" />'
+'			  </div>'
+'			  <div class="form-group wider">'
+'				<input id="value" class="form-control input-sm" type="text" placeholder="Value" />'
+'			  </div>'
+'			  <button id="add" type="button" class="btn btn-success btn-sm">Add</button>'
+'			  <button id="clear" type="button" class="btn btn-danger btn-sm">Clear All</button>'
+'			  <button id="close" type="button" class="btn btn-danger btn-sm">Close</button>'
+'			</form>'
+'			<div class="progress">'
+'				<div class="progress-bar progress-bar-success" role="progressbar" id="space" aria-valuemin="0" aria-valuemax="100" style="width:0"></div>'
+'				<label class="alert-success"><span id="available">90</span>% Available</label>'
+'			</div>'
+'			<table class="table table-condensed table-striped table-bordered table-hover">'
+'				<thead>'
+'					<tr>'
+'						<th width="20%">Key</th>'
+'						<th width="70%">Value</th>'
+'						<th class="text-center">Action</th>'
+'					</tr>'
+'				</thead>'
+'				<tbody class="localstorage-table" id="table-content">'
+'					<tr class="nothing text-center">'
+'						<td colspan="3">'
+'							Nothing stored in localstorage under current domain'
+'						</td>'
+'					</tr>'
+'				</tbody>'
+'			</table>'
+'			<script src="chrome-extension://'+extensionid+'/lib/jquery-1.10.2.min.js"></script>'
+'			<script src="chrome-extension://'+extensionid+'/lib/bootstrap.min.js"></script>'
+'			<script src="chrome-extension://'+extensionid+'/lib/cssua.min.js"></script>'
+'			<script src="chrome-extension://'+extensionid+'/localstorage.js"></script>'
+'			<script src="chrome-extension://'+extensionid+'/popup-native.js"></script>';

