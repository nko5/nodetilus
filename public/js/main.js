$(document).ready(function(){
  init();
});



function init() {
  console.log('init');

  $("#nautilusForm" ).submit(function( event ) {
  	enableLoading();
  	event.preventDefault();
  });
}



function enableLoading() {
	$("#nautilusForm :input").prop("disabled", true);
	$('#loading-overlay').show();
}

function disbleLoading() {
	$('#loading-overlay').hide();
	$("#nautilusForm :input").prop("disabled", false);
}