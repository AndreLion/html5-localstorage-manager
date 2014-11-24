var sendMessage = function(ev,cb,data){
    if(window.chrome && window.chrome.tabs){
        chrome.tabs.query({"status":"complete","windowId":chrome.windows.WINDOW_ID_CURRENT,"active":true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{source:'popup',event:ev,data:data},cb);
        });
    }else{
        switch(ev){
            case 'pull':
                cb(dump());
                break;
            case 'pullSession':
                cb(dumpSession());
                break;
            case 'pullCookie':
                cb(dumpCookie());
                break;
            case 'add':
                local.setItem(data.key,data.value);
                cb(dump());
                break;
            case 'addSession':
                session.setItem(data.key,data.value);
                cb(dumpSession());
                break;
            case 'addCookie':
                Cookies.set(data.key,data.value);
                cb(dumpCookie());
                break;
            case 'remove':
                local.removeItem(data.key);
                cb(dump());
                break;
            case 'removeSession':
                session.removeItem(data.key);
                cb(dumpSession());
                break;
            case 'removeCookie':
                Cookies.expire(data.key);
                cb(dumpCookie());
                break;
            case 'clear':
                local.clear();
                cb(dump());
                break;
            case 'clearSession':
                session.clear();
                cb(dumpSession());
                break;
            case 'clearCookie':
                for(var i=0,l=data.c.length;i<l;i++){
                    Cookies.expire(data.c[i].key);
                }
                break;
        }
    }
};

var selectElementContents = function(el){
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
var extension = angular.module('storageManagerApp',['ui.bootstrap','ngSanitize']);

extension.directive('ngContenteditable', ['$sce', function($sce){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function ($scope, element, attrs, ngModel) { 
            if (!ngModel) return;
            function read() {
                var text = element.text();
                /*if ( attrs.stripBr && html == '<br>' ) {
                    html = '';
                }*/
                ngModel.$setViewValue(text);
            }
            $scope.$watch('editing',function(editing,oldEditing){
                if(editing === $scope.item.key && $scope.editingType === $scope.item.type){
                    attrs.$set('contenteditable','plaintext-only');
                    selectElementContents(element[0]);
                    $scope.item.expand = true;
                }else{
                    attrs.$set('contenteditable',false);
                }
            });
            $scope.$watch('item.expand',function(expand,oldExpand){
                ngModel.$render();
            });
            ngModel.$render = function() {
                var text = ngModel.$viewValue || '';
                var length = text.length;
                if(length>300 && !$scope.item.expand){
                    text = text.substr(0,300)+' ... ('+(length-300)+' chars more)';
                }
                element.text(text);
            };
            element.on('blur keyup change', function() {
                $scope.$apply(read);
            });
            //read();
        }
    }
}]);

extension.controller('cookieController',function($scope){
    $scope.cookies = [];
    $scope.editing = false;

    $scope.refresh = function(){
		sendMessage('pullCookie',function(data){
			$scope.cookies = data;
            $scope.$apply();
		});
    };
    $scope.edit = function(key){
        $scope.editing = key;
    };
    $scope.submit = function(key,value){
        $scope.editing = false;
		sendMessage('editCookie',function(data){
			$scope.cookies = data;
            $scope.$apply();
		},{key:key,value:value});
    };
    $scope.add = function(){
        sendMessage('addCookie',function(data){
			$scope.cookies = data;
            $scope.key = '';
            $scope.value= '';
            $scope.$apply();
        },{key:$scope.key,value:$scope.value});
    };
    $scope.remove = function(key){
		sendMessage('removeCookie',function(data){
			$scope.cookies = data;
            $scope.$apply();
		},{key:key});
    };
    $scope.clear = function(){
		sendMessage('clearCookie',function(data){
			$scope.cookies = data;
            $scope.$apply();
		},{c:$scope.cookies});
    };
    $scope.dump = function(key,value){
		sendMessage('dump',function(){},{key:key,value:value,type:'cookie'});
    };

    sendMessage('pullCookie',function(data){
        $scope.cookies = data;
    });
});

extension.controller('indexedDBController',function($scope){
    $scope.database = '';
    $scope.version = '';
    $scope.databases = [];
    $scope.history = null;
    var req, db;
    var _pool = {};
    var _history = {};
    var onSuccess = function(_name,db){
        var IDBObjectStore;
        _pool[_name].status = 'connected';
        _pool[_name].db = db;
        for(var i=0,l=db.objectStoreNames.length;i<l;i++){
            var storeName = db.objectStoreNames[i];
            var objTable = {
                name:null,
                rows:[],
                keys:null
            };
            _pool[_name].ref.tables.push(objTable);
            _pool[_name].tables[storeName] = {};
            _pool[_name].tables[storeName].ref = objTable;
            IDBObjectStore = db.transaction(storeName).objectStore(storeName);
            _pool[_name].tables[storeName].ref.indexNames = IDBObjectStore.indexNames;
            _pool[_name].tables[storeName].ref.keyPath = IDBObjectStore.keyPath;
            _pool[_name].tables[storeName].ref.name = IDBObjectStore.name;
            IDBObjectStore.openCursor().onsuccess = function(ev){
                var cursor = ev.target.result;
                if(cursor){
                    _pool[_name].tables[storeName].ref.rows.push(cursor.value);
                    cursor.continue();
                }else{
                    $scope.$apply();
                    db.close();
                }
            };
        }
    };
    var displayData = function(){
        var objectStore = db.transaction('indexedDB').objectStore('indexedDB');
        objectStore.openCursor().onsuccess = function (ev) {
            var cursor = event.target.result;
            if (cursor) {
                if($scope.history == null ){
                    $scope.history = {};
                }
                $scope.history[cursor.value.name] = cursor.value.version;
                cursor.continue();
            }
            $scope.$apply();
        };
        
    };
    $scope.openWindow = function(key){
		sendMessage('popup',function(){},{hash:'indexedDB'});
    };

    $scope.connect = function(){
        var name = $scope.database;
        var version = $scope.version;
        var _req;
        if(!_pool[name]){
            var objDB = {
                name:name,
                version:version,
                tables:[]
            };
            _pool[name] = {
                'status':'connecting',
                ref:objDB,
                tables:{}
            };
            $scope.databases.push(objDB);
            _pool[name].request = window.indexedDB.open(name,version);
            _pool[name].request.onupgradeneeded = function(ev){
                onSuccess(name,ev.target.result);
            }
            _pool[name].request.onsuccess = function(ev){
                onSuccess(name,ev.target.result);
            }
        }
        var transaction = db.transaction(['indexedDB'], 'readwrite');
        transaction.oncomplete = function () {
            displayData();
        };
        var objectStore = transaction.objectStore('indexedDB');
        var objectStoreRequest = objectStore.add({name:name,version:version});
    }
    $scope.fill = function(name,version){
        $scope.database = name;
        $scope.version = version;
    }
    $scope.clearHistory = function(){
        debugger;
        db.transaction(['indexedDB'], 'readwrite').objectStore('indexedDB').clear();
        $scope.history = null;
    }
    req = window.indexedDB.open('HTML5StorageManagerHistory',1);
    req.onupgradeneeded = function(ev){
        db = ev.target.result;
        var objectStore = db.createObjectStore('indexedDB', {
            keyPath:'name' 
        });
        objectStore.createIndex('version', 'version', {
            unique: false
        });
    };
    req.onsuccess = function(ev){
        db = ev.target.result;
        displayData();
    };
});

extension.controller('storageController',function($scope){
    $scope.type = 'local';
    $scope.localStorage = [];
    $scope.sessionStorage = [];
    $scope.editing;
    $scope.editingType;
    $scope.percentage = 0;
    $scope.showSession = true;
    $scope.add = function(){
        sendMessage('add',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            $scope.key = '';
            $scope.value= '';
            $scope.$apply();
        },{key:$scope.key,value:$scope.value});
    };
    $scope.addSession = function(){
        sendMessage('addSession',function(data){
            $scope.sessionStorage = data;
            $scope.key = '';
            $scope.value= '';
            $scope.$apply();
        },{key:$scope.key,value:$scope.value});
    };
    $scope.clear = function(){
		sendMessage('clear',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            $scope.$apply();
		});
    };
    $scope.clearSession = function(){
		sendMessage('clearSession',function(data){
            $scope.sessionStorage = data;
            $scope.$apply();
		});
    };
    $scope.edit = function(key,type){
        $scope.editing = key;
        $scope.editingType = type;
    };
    $scope.submit = function(key,value){
        $scope.editing = false;
		sendMessage('add',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            $scope.$apply();
		},{key:key,value:value});
    };
    $scope.submitSession = function(key,value){
        $scope.editing = false;
		sendMessage('addSession',function(data){
            $scope.sessionStorage = data;
            $scope.$apply();
		},{key:key,value:value});
    };
    $scope.cancel = function(){
        $scope.editing = false;
    };
    $scope.dump = function(key,value,type){
		sendMessage('dump',function(){},{key:key,value:value,type:type});
    };
    $scope.remove = function(key){
		sendMessage('remove',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            $scope.$apply();
		},{key:key});
    };
    $scope.removeSession = function(key){
		sendMessage('removeSession',function(data){
            $scope.sessionStorage = data;
            $scope.$apply();
		},{key:key});
    };
    $scope.openWindow = function(key){
		sendMessage('popup',function(){},{hash:'storage'});
    };

	sendMessage('pull',function(data){
        $scope.localStorage = data.storage;
        $scope.percentage = data.percentage;
        $scope.$apply();
	});

	sendMessage('pullSession',function(data){
        $scope.sessionStorage = data;
        $scope.$apply();
	});

    if(window.chrome && window.chrome.runtime && window.chrome.runtime.onMessage){
        chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
            if(message.source === 'content'){
                if(message.event === 'sync'){
                    $scope.localStorage = data.storage;
                    $scope.percentage = data.percentage;
                    $scope.$apply();
                }
            }
        });
    }

});

sendMessage('onload');
