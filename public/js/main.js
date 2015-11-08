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
        full_name: 'Repo 1',
        html_url: 'https://github.com/nko5/nodetilus',
        score: '70'
      },
      {
        full_name: 'Repo 2',
        html_url: 'https://github.com/nko5/nodetilus',
        score: '80'
      }
    ];

    //TODO: Replace mockResponse with response
    $.map(mockResponse, function(repo) {
      console.log(repo.full_name, repo.html_url, repo.score);
      $('ul.nodetilus_results').append('<li class="list-group-item">' + repo.full_name + ' - <a href="'+ repo.html_url +'" target="_blank">View on github<a/></li>');
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