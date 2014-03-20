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
	var renderCookie = function(c){
		var cookies = c.split(';');
		if(cookies.length > 1){
			var result = {};
			for(var i=0,l=cookies.length;i<l;i++){
				var pair = cookies[i].split('=');
				var key = pair.shift();
				var value = pair.join('');
				result[key] = value;
			}

			var table = $('#cookie-content');
			table.removeClass('has-data').find('tr.something').remove();
			$.each(result,function(key,value){
				table.append(newCookieRow(key,value));
			});
			table.addClass('has-data');
		}

	};

	var sendMessage = function(ev,cb,data){
		chrome.tabs.query({"status":"complete","windowId":chrome.windows.WINDOW_ID_CURRENT,"active":true}, function(tabs){
			chrome.tabs.sendMessage(tabs[0].id,{source:'popup',event:ev,data:data},cb);
		});
	};

	chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
		if(message.source === 'content'){
			if(message.event === 'sync'){
				render(message.data);
			}
		}
	});

	sendMessage('onload');
	sendMessage('pull',function(data){
		render(data);
	});
	sendMessage('pullCookie',function(data){
		renderCookie(data);
	});
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
	$('#refresh').on('click',function(){
		sendMessage('pullCookie',function(data){
			renderCookie(data);
		});
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
