chrome.storage.sync.get('alwaysShowIcon',function(o){
	if(o.alwaysShowIcon){
		document.getElementById('show').checked = true;
	}else{
		document.getElementById('hide').checked = true;
	}
});
document.getElementById('hide').addEventListener('click',function(){
	//
  chrome.storage.sync.set({
    alwaysShowIcon: false
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
});document.getElementById('show').addEventListener('click',function(){
	//
  chrome.storage.sync.set({
    alwaysShowIcon: true
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
});
