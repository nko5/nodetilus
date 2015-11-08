$(document).ready(function(){
  init();
});

function init() {
  $('#nautilus_form' ).submit(getRepos);
}

function getRepos( event ) {
  var data = { repo_url: $('#repo_url').val()};

  enableLoading();

  $.get( '/api/repo', data, function(response) {
    console.log('Search result:', response);
    displayResults(response);
  });

  event.preventDefault();
}

function displayResults(response) {
  setTimeout(function() {
    disbleLoading();
    $('#result').text(response);
  }, 300);
}

function enableLoading() {
  $('#nautilusForm :input').prop('disabled', true);
  $('#loading-overlay').show();
}

function disbleLoading() {
  $('#nautilusForm :input').prop('disabled', false);
  $('#loading-overlay').hide();
}