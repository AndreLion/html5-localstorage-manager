var store = window.localStorage;
var support = function() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

var longtext = function(size) {
	var result = [];
	var str1k= 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborumLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolor'; 
	while(size--){
		result.push(str1k);
	}
	return result.join('');
}

var setItem = function(key,value){
	try{
		store.setItem(key,value);
	}catch(e){
		console.log('error');
		console.log(e);
	}
};
var newRow = function(key,value){
	var node = $('<tr class="something" key="'+key+'"><td class="key"><span class="json"></span><div class="inner"><div class="content" /></div><a href="#" class="more">Show All</a></td><td class="value"><div class="inner"><div class="content" /></div><a href="#" class="more">Show All</a></td><td><button type="button" class="btn btn-success btn-xs btn-block confirm">Confirm</button><button type="button" class="btn btn-warning btn-xs btn-block cancel">Cancel</button><button type="button" class="btn btn-primary btn-xs btn-block dump" title="Send JSON object to console">Dump JSON</button><button type="button" class="btn btn-primary btn-xs btn-block edit">Edit</button><button type="button" class="btn btn-danger btn-xs btn-block remove">Remove</button></td></tr>');
	node.find('.key .content').text(key);
	node.find('.value .content').text(value);
	var kih = node.find('.key .inner').height(),
		kch = node.find('.key .content').height(),
		vih = node.find('.value .inner').height(),
		vch = node.find('.value .content').height();
	if(kih < kch){
		node.find('.key').addClass('long-text');
	}
	if(vih < vch){
		node.find('.value').addClass('long-text');
	}
	try{
		JSON.parse(value);
		node.addClass('is-json');
	}catch(e){}
	return node;
}

var selectElementContents = function(el){
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

var storageSize = function(){
	var result = 0;
	for(var i=0,l=store.length;i<l;i++){
		var key = store.key(i);
		var value = store.getItem(key);
		result += key.length;
		result += value.length;
	}
	return result;

}

var renderTable = function(){
	var content = $('#table-content');
	for(var i=0,l=store.length;i<l;i++){
		var key = store.key(i);
		var value = store.getItem(key);
		var node = newRow(key,value);
		content.append(node);
	}
	if(l>0){
		content.addClass('has-data');
	}
}

var renderSpace = function(){
	var space = $('#space');
	var limit;
	var used = storageSize();
	var ua = cssua.ua;
	if(ua.chrome || ua.safari){
		limit = 2621440;
	}else if(ua.firefox){
	}else if(ua.ie){
	}
	percent = used/limit*100;
	space.css('width',percent+'%');
	$('#available').text((100-percent).toFixed(2));
}
