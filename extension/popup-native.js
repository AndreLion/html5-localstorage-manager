var render = function(){
	$('#table-content').removeClass('has-data').find('tr.something').remove();
	renderTable();
	renderSpace();
};
window.addEventListener("storage", render, false);
$('#add').on('click',function(ev){
	var key = $('#key').val();
	var value = $('#value').val();
	$('#key').closest('div.form-group')[(key===''?'add':'remove')+'Class']('has-error');
	$('#value').closest('div.form-group')[(value===''?'add':'remove')+'Class']('has-error');
	if(key !== '' && value !== ''){
		setItem(key,value);
		$('#key,#value').val('');
	}
	render();
});
$('#clear').on('click',function(ev){
	store.clear();
	render();
});
$('#close').on('click',function(ev){
	window.close();
});
$('#table-content').on('click','.more',function(ev){
	ev.preventDefault();
	$(this).closest('td').addClass('show-all');
});
$('#table-content').on('click','.remove',function(ev){
	var tr = $(ev.target).closest('tr');
	var key = tr.attr('key');
	store.removeItem(key);
	render();
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
	setItem(key,value);
	render();
});
$('#table-content').on('click','.cancel',function(ev){
	var tr = $(ev.target).closest('tr');
	var edit = tr.find('.value .content');
	edit.css('height','');
	edit.attr('contenteditable',false);
	tr.removeClass('updating');
	$(window).focus();
	render();
});
$('#table-content').on('click','.dump',function(ev){
	var tr = $(ev.target).closest('tr');
	var key = tr.attr('key');
	var value = tr.find('.value .content').text();
	console.log('HTML5 LocalStorage Manager dump JSON of key \''+key+'\' :');
	console.dir(JSON.parse(value));
	tr.addClass('dumped');
	setTimeout(function(){
		tr.removeClass('dumped');
	},2000);
});
renderTable();
renderSpace();
$('#domain').text(location.origin);
$('.snapshot').find('img').each(function(index,node){
	var n = $(node);
	n.attr('src',n.data('src'));
});
