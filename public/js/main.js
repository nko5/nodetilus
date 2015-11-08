$(document).ready(function(){
  init();
});

function init() {
  console.log('init');

  $('#nautilusForm' ).submit(getRepos);
}

function getRepos( event ) {
	var data = {};

	enableLoading();
	event.preventDefault();

	data = $('#repoURL').val();

	$.get( '/api/repo', data, function( data ) {
		console.log('Search result:', data);
		$('#result').html( data );
		disbleLoading();
	});
}

function enableLoading() {
	$('#nautilusForm :input').prop('disabled', true);
	$('#loading-overlay').show();
}

function disbleLoading() {
	$('#nautilusForm :input').prop('disabled', false);
	$('#loading-overlay').hide();
}