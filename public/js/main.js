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

    var mockResponse = [
      {
        name: 'Repo 1',
        url: 'https://github.com/nko5/nodetilus',
        nodetilus_score: '70'
      },
      {
        name: 'Repo 2',
        url: 'https://github.com/nko5/nodetilus',
        nodetilus_score: '80'
      }
    ];

    //TODO: Replace mockResponse with response
    $.map(mockResponse, function(repo) {
      console.log(repo.name, repo.url, repo.nodetilus_score);
      $('ul.nodetilus_results').append('<li class="">' + repo.name + ' - Nodetilus score: ' + repo.nodetilus_score + ' - <a href="'+ repo.url +'" target="_blank">View on github<a/></li>');
    });

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