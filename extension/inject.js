var inited = false;
var extensionid = 'giompennnhheakjcnobejbnjgbbkmdnd'; //online
//var extensionid = 'kmclokmeccmafganmdhcodpgdobjmklk'; //offline
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
			sendResponse(dumpCookie());
		}else if(message.event  === 'clear'){
			local.clear();
			sendResponse(dump());
		}else if(message.event  === 'clearSession'){
			session.clear();
			sendResponse(dumpSession());
		}else if(message.event  === 'clearCookie'){
            for(var i=0,l=message.data.c.length;i<l;i++){
                Cookies.expire(message.data.c[i].key);
            }
			sendResponse(dumpCookie());
		}else if(message.event  === 'remove'){
			local.removeItem(message.data.key);
			sendResponse(dump());
		}else if(message.event  === 'removeSession'){
			session.removeItem(message.data.key);
			sendResponse(dumpSession());
		}else if(message.event  === 'removeCookie'){
			Cookies.expire(message.data.key);
			sendResponse(dumpCookie());
		}else if(message.event  === 'add'){
			local.setItem(message.data.key,message.data.value);
			sendResponse(dump());
		}else if(message.event  === 'addCookie'){
			Cookies.set(message.data.key,message.data.value);
			sendResponse(dumpCookie());
		}else if(message.event  === 'editCookie'){
			Cookies.set(message.data.key,message.data.value);
			sendResponse(dumpCookie());
		}else if(message.event  === 'addSession'){
			session.setItem(message.data.key,message.data.value);
			sendResponse(dumpSession());
		}else if(message.event  === 'dump'){
            console.log('%c [Dump JSON by HTML5 Storage Manager All in One]','background: yellow; color: darkblue');
            console.log(message.data.type+' '+message.data.key+' :  %O', JSON.parse(message.data.value));
		}else if(message.event  === 'popup'){
			winPopup = window.open("/chrome-extension-localstorage-manager-popup-404.html","storagemanager","toolbar=yes, scrollbars=yes, resizable=yes, width=580, height=600");
			winPopup.onload = function(ev){
                winPopup.document.write(popupHTML);
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
+'	  	  <link rel="stylesheet" href="chrome-extension://'+extensionid+'/lib/bootstrap.min.css" />'
+'	  	  <link rel="stylesheet" href="chrome-extension://'+extensionid+'/popup.css" />'
+'        <tabset>'
+'            <tab heading="Storage" ng-controller="storageController">'
+'                <div class="row">'
+'                    <div class="btn-group col-xs-6">'
+'                        <label class="btn btn-default btn-sm" ng-model="type" btn-radio="\'local\'">Local Storage</label>'
+'                        <label class="btn btn-info btn-sm" ng-model="type" btn-radio="\'session\'">Sessin Storage</label>'
+'                    </div>'
+'                    <div class="col-xs-6 text-right">'
//+'                        <button ng-click="openWindow()" type="button" class="btn btn-primary btn-sm">Popup in new window <span class="glyphicon glyphicon-new-window"></span></button>'
+'                    </div>'
+'                </div>'
+'                <form class="row add" role="form" ng-submit="type==\'session\'?addSession():add()">'
+'                    <div class="col-xs-3">'
+'                        <input ng-model="key" class="form-control input-sm" type="text" placeholder="{{type}} storage key" ng-class="{session:type==\'session\'}" />'
+'                    </div>'
+'                    <div class="col-xs-6">'
+'                        <input ng-model="value" class="form-control input-sm" type="text" placeholder="{{type}} storage value" ng-class="{session:type==\'session\'}" />'
+'                    </div>'
+'                    <div class="col-xs-3 text-right">'
+'                        <button type="submit" class="btn btn-success btn-sm">Add</button>'
+'                        <button ng-click="type==\'session\'?clearSession():clear()" type="button" class="btn btn-danger btn-sm">Remove All</button>'
+'                    </div>'
+'                </form>'
+'                <progressbar value="percentage" type="success"><b>{{100-percentage}}% Available</b></progressbar>'
+'                <div class="text-right" ng-show="sessionStorage.length">'
+'                    <label> <input type="checkbox" ng-model="showSession"/> Show Session Storage </label> '
+'                </div>'
+'                <table class="table table-condensed table-bordered table-hover">'
+'                    <thead>'
+'                        <tr>'
+'                            <th width="15%">Key</th>'
+'                            <th width="70%">Value</th>'
+'                            <th class="text-center">Action</th>'
+'                        </tr>'
+'                    </thead>'
+'                    <tbody>'
+'                        <tr ng-repeat="item in sessionStorage" class="something info" ng-class="{editing:editing==item.key}" ng-show="showSession">'
+'                            <td class="key">'
+'                                <span ng-show="item.isJson" class="json"></span>'
+'                                <div class="inner">'
+'                                    <div class="content">{{item.key}}</div>'
+'                                </div>'
+'                            </td>'
+'                            <td class="value" ng-contenteditable ng-model="item.value" strip-br="true"></td>'
+'                            <td class="action">'
+'                                <button type="button" ng-click="submitSession(item.key,item.value)" ng-show="editing==item.key" class="btn btn-success btn-xs btn-block">Confirm</button>'
+'                                <button type="button" ng-click="cancel()" ng-show="editing==item.key" class="btn btn-warning btn-xs btn-block">Cancel</button>'
+'                                <button type="button" ng-click="dump(item.key,item.value,\'session storage\')" ng-hide="editing==item.key || !item.isJson" tooltip="Dump JSON to DevTool Console" class="btn btn-primary btn-xs btn-block">Dump JSON</button>'
+'                                <button type="button" ng-click="edit(item.key,\'session\')" ng-hide="editing==item.key" class="btn btn-primary btn-xs btn-block edit">Edit</button>'
+'                                <button type="button" ng-click="removeSession(item.key)" ng-hide="editing==item.key" class="btn btn-danger btn-xs btn-block remove">Remove</button>'
+'                                <button type="button" ng-click="item.expand=true" ng-show="item.value.length>300 && !item.expand && editing !=item.key" class="btn btn-warning btn-xs btn-block remove">Show All</button>'
+'                                <button type="button" ng-click="item.expand=false" ng-show="item.value.length>300 && item.expand && editing !=item.key" class="btn btn-warning btn-xs btn-block remove">Show Less</button>'
+'                            </td>'
+'                        </tr>'
+'                        <tr ng-repeat="item in localStorage" class="something" ng-class="{editing:editing==item.key}">'
+'                            <td class="key">'
+'                                <span ng-show="item.isJson" class="json"></span>'
+'                                <div class="inner">'
+'                                    <div class="content">{{item.key}}</div>'
+'                                </div>'
+'                            </td>'
+'                            <td class="value" ng-contenteditable ng-model="item.value" strip-br="true"></td>'
+'                            <td class="action">'
+'                                <button type="button" ng-click="submit(item.key,item.value)" ng-show="editing==item.key" class="btn btn-success btn-xs btn-block">Confirm</button>'
+'                                <button type="button" ng-click="cancel()" ng-show="editing==item.key" class="btn btn-warning btn-xs btn-block">Cancel</button>'
+'                                <button type="button" ng-click="dump(item.key,item.value,\'local storage\')" ng-hide="editing==item.key || !item.isJson" tooltip="Dump JSON to DevTool Console" class="btn btn-primary btn-xs btn-block">Dump JSON</button>'
+'                                <button type="button" ng-click="edit(item.key,\'local\')" ng-hide="editing==item.key" class="btn btn-primary btn-xs btn-block edit">Edit</button>'
+'                                <button type="button" ng-click="remove(item.key)" ng-hide="editing==item.key" class="btn btn-danger btn-xs btn-block remove">Remove</button>'
+'                                <button type="button" ng-click="item.expand=true" ng-show="item.value.length>300 && !item.expand && editing !=item.key" class="btn btn-warning btn-xs btn-block remove">Show All</button>'
+'                                <button type="button" ng-click="item.expand=false" ng-show="item.value.length>300 && item.expand && editing !=item.key" class="btn btn-warning btn-xs btn-block remove">Show Less</button>'
+'                            </td>'
+'                        </tr>'
+'                        <tr ng-hide="localStorage.length || sessionStorage.length" class="nothing text-center">'
+'                            <td colspan="3">'
+'                                Nothing stored in SessionStorage or LocalStorage under current domain'
+'                            </td>'
+'                        </tr>'
+'                    </tbody>'
+'                </table>'
+'            </tab>'
+'            <tab heading="Cookie" ng-controller="cookieController">'
+'                <button ng-click="refresh()" type="button" class="btn btn-primary btn-sm">Refresh <span class="glyphicon glyphicon-refresh"></span></button>'
+'                <form class="row add" role="form" ng-submit="add()">'
+'                    <div class="col-xs-3">'
+'                        <input ng-model="key" class="form-control input-sm" type="text" placeholder="cookie name" />'
+'                    </div>'
+'                    <div class="col-xs-6">'
+'                        <input ng-model="value" class="form-control input-sm" type="text" placeholder="cookie value" />'
+'                    </div>'
+'                    <div class="col-xs-3 text-right">'
+'                        <button type="submit" class="btn btn-success btn-sm">Add</button>'
+'                        <button ng-click="clear()" type="button" class="btn btn-danger btn-sm">Remove All</button>'
+'                    </div>'
+'                </form>'
+'                <table class="table table-condensed table-bordered table-hover">'
+'                    <thead>'
+'                        <tr>'
+'                            <th width="15%">Name</th>'
+'                            <th width="70%">Value</th>'
+'                            <th class="text-center">Action</th>'
+'                        </tr>'
+'                    </thead>'
+'                    <tbody>'
+'                        <tr ng-repeat="item in cookies" class="something">'
+'                            <td class="key">'
+'                                <div class="inner">'
+'                                    <div class="content">{{item.key}}</div>'
+'                                </div>'
+'                            </td>'
+'                            <td class="value" ng-contenteditable ng-model="item.value" strip-br="true"></td>'
+'                            <td class="action">'
+'                                <button type="button" ng-click="submit(item.key,item.value)" ng-show="editing==item.key" class="btn btn-success btn-xs btn-block">Confirm</button>'
+'                                <button type="button" ng-click="cancel()" ng-show="editing==item.key" class="btn btn-warning btn-xs btn-block">Cancel</button>'
+'                                <button type="button" ng-click="dump(item.key,item.value)" ng-hide="editing==item.key || !item.isJson" tooltip="Dump JSON to DevTool Console" class="btn btn-primary btn-xs btn-block">Dump JSON</button>'
+'                                <button type="button" ng-click="edit(item.key)" ng-hide="editing==item.key" class="btn btn-primary btn-xs btn-block edit">Edit</button>'
+'                                <button type="button" ng-click="remove(item.key)" ng-hide="editing==item.key" class="btn btn-danger btn-xs btn-block remove">Remove</button>'
+'                                <button type="button" ng-click="item.expand=true" ng-show="item.value.length>300 && !item.expand && editing !=item.key" class="btn btn-warning btn-xs btn-block remove">Show All</button>'
+'                                <button type="button" ng-click="item.expand=false" ng-show="item.value.length>300 && item.expand && editing !=item.key" class="btn btn-warning btn-xs btn-block remove">Show Less</button>'
+'                            </td>'
+'                        </tr>'
+'                        </tr>'
+'                        <tr ng-hide="cookies.length" class="nothing text-center">'
+'                            <td colspan="3">'
+'                                No cookie found.'
+'                            </td>'
+'                        </tr>'
+'                    </tbody>'
+'                </table>'
+'            </tab>'
+'            <tab heading="indexedDB" ng-controller="indexedDBController">'
+'                <table class="table table-condensed table-striped table-bordered table-hover" style="visibility:hidden;">'
+'                    <thead>'
+'                        <tr>'
+'                            <th class="text-center"></th>'
+'                        </tr>'
+'                    </thead>'
+'                </table>'
+'                <p class="text-center">'
+'                    <a href="https://github.com/AndreLion/html5-localstorage-manager/issues/8" target="_blank">Anyone using indexedDB?</a>'
+'                </p>'
+'            </tab>'
+'        </tabset>'
+'        <script src="chrome-extension://'+extensionid+'/lib/angular.min.js"></script>'
+'        <script src="chrome-extension://'+extensionid+'/lib/angular-sanitize.min.js"></script>'
+'        <script src="chrome-extension://'+extensionid+'/lib/ui-bootstrap-tpls-0.11.2.min.js"></script>'
+'        <script src="chrome-extension://'+extensionid+'/lib/cookies.min.js"></script>'
+'        <script src="chrome-extension://'+extensionid+'/common.js"></script>'
+'        <script src="chrome-extension://'+extensionid+'/popup.js"></script>'
+'        <script>angular.bootstrap(document, ["storageManagerApp"]);</script>'
+'';
