chrome.storage.sync.get('alwaysShowIcon',function(o){
	if(o.alwaysShowIcon){
		document.getElementById('show').checked = true;
		document.getElementById('options-icon').className = 'always thumbnail';
	}else{
		document.getElementById('hide').checked = true;
		document.getElementById('options-icon').className = 'thumbnail';
	}
});
document.getElementById('hide').addEventListener('click',function(){
	//
  document.getElementById('options-icon').className = 'thumbnail';
  chrome.storage.sync.set({
    alwaysShowIcon: false
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    status.style.display = 'inline-block';
    setTimeout(function() {
      status.textContent = '';
      status.style.display = 'none';
    }, 750);
  });
});document.getElementById('show').addEventListener('click',function(){
	//
  document.getElementById('options-icon').className = 'always thumbnail';
  chrome.storage.sync.set({
    alwaysShowIcon: true
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    status.style.display = 'inline-block';
    setTimeout(function() {
      status.textContent = '';
    status.style.display = 'none';
    }, 750);
  });
});
