var sendMessage = function(ev,cb,data){
    chrome.tabs.query({"status":"complete","windowId":chrome.windows.WINDOW_ID_CURRENT,"active":true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id,{source:'popup',event:ev,data:data},cb);
    });
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
                console.log('ngModel.$setViewValue',text);
            }
            $scope.$watch('editing',function(editing,oldEditing){
                if(editing === $scope.item.key){
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
                var text = $sce.getTrustedHtml(ngModel.$viewValue || '');
                var length = text.length;
                if(length>300 && !$scope.item.expand){
                    text = text.substr(0,300)+'...( '+(length-300)+' chars more )';
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

	var parseCookie = function(c){
        var result = [];
		var arr = c.split(';');
        for(var i=0,l=arr.length;i<l;i++){
            if(arr[i] === ''){
                continue;
            }
            var pair = arr[i].split('=');
            var key = pair.shift();
            var value = pair.join('');
            result.push({
                key:key,
                value:value
            });
        }
        return result;
	};

    $scope.cookies = [];

    $scope.refresh = function(){
		sendMessage('pullCookie',function(data){
			$scope.cookies = parseCookie(data);
            $scope.$apply();
		});
    };

    sendMessage('pullCookie',function(data){
        $scope.cookies = parseCookie(data);
    });

});
extension.controller('storageController',function($scope){
    
    var factory = {
        localstorage :{
            add: function(){
            },
            remove: function(){
            }
        }
    };

    $scope.type = 'localstorage';
    $scope.localStorage = [];
    $scope.editing = false;
    $scope.percentage = 0;
    $scope.add = function(){
        sendMessage('add',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
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
    $scope.edit = function(key){
        $scope.editing = key;
    };
    $scope.submit = function(key,value){
        $scope.editing = false;
		sendMessage('add',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            $scope.$apply();
		},{key:key,value:value});
    };
    $scope.cancel = function(){
        $scope.editing = false;
    };
    $scope.dump = function(key,value){
		sendMessage('dump',function(){},{key:key,value:value});
    };
    $scope.remove = function(key){
		sendMessage('remove',function(data){
            $scope.localStorage = data.storage;
            $scope.percentage = data.percentage;
            $scope.$apply();
		},{key:key});
    };

	sendMessage('pull',function(data){
        $scope.localStorage = data.storage;
        $scope.percentage = data.percentage;
        $scope.$apply();
	});

    chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
        if(message.source === 'content'){
            if(message.event === 'sync'){
                $scope.localStorage = data.storage;
                $scope.percentage = data.percentage;
                $scope.$apply();
            }
        }
    });

});

sendMessage('onload');

/*
$(function(){
	var render = function(data){
		var table = $('#table-content');
		table.removeClass('has-data').find('tr.something').remove();
		var len = 0;
		var limit = 2621440;
		var hasData = false;
		$.each(data,function(key,value){
			len += key.length;
			len += value.length;
			table.append(newRow(key,value));
			hasData = true;
		});
		if(hasData){
			table.addClass('has-data');
		}
		var percent = len/limit*100;
		$('#space').css('width',percent+'%');
		$('#available').text((100-percent).toFixed(2));
	};

	$('#clear').on('click',function(){
		sendMessage('clear',function(data){
			render(data);
		});
	});
	$('#add').on('click',function(){
		var key = $('#key').val();
		var value = $('#value').val();
		sendMessage('add',function(data){
			render(data)
			$('#key,#value').val('');
		},{key:key,value:value});
	});
	$('#popup').on('click',function(){
		sendMessage('popup');
	});
	$('#table-content').on('click','.remove',function(ev){
		var tr = $(ev.target).closest('tr');
		var key = tr.attr('key');
		sendMessage('remove',function(data){
			render(data);
		},{key:key});
	});
	$('#table-content').on('click','.edit',function(ev){
		var tr = $(ev.target).closest('tr');
		var edit = tr.addClass('updating').find('.value .content');
		edit.css('height',edit.height()+'px');
		edit.attr('contenteditable',true);
		selectElementContents(edit[0]);
	});
	$('#table-content').on('click','.confirm',function(ev){
		var tr = $(ev.target).closest('tr');
		var key = tr.attr('key');
		var value = tr.find('.value .content').text();
		tr.removeClass('updating');
		sendMessage('add',function(data){
			render(data)
		},{key:key,value:value});
	});
	$('#table-content').on('click','.cancel',function(ev){
		var tr = $(ev.target).closest('tr');
		var edit = tr.find('.value .content');
		edit.css('height','');
		edit.attr('contenteditable',false);
		tr.removeClass('updating');
	});
	$('#table-content').on('click','.dump',function(ev){
		var tr = $(ev.target).closest('tr');
		var key = tr.attr('key');
		var value = tr.find('.value .content').text();
		sendMessage('dump',function(){
		},{key:key,value:value});
		tr.addClass('dumped');
		setTimeout(function(){
			tr.removeClass('dumped');
		},2000);
	});
})
*/
