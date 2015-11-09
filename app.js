var express = require('express');
var app = express();
const when = require('when');

//Create a static file server
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

// //Get the dummy data
// require('./server/ddata.js');

const gitHubHandler = require('./scripts/gitHubHandler')();
const dbHandler = require('./scripts/dbHandler')();
const nodetilus = require('./scripts/nodetilus')();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

var topTen;

const fightAPlace = function(repo) {
  // nodetilus_score
  if(topTen.length < 10 ) {
    topTen.push(repo);
    return true;
  }

  var updated = false;
  for(var i=0, len=topTen.length; i<len; i++) {
    if(repo.nodetilus_score > topTen[i].nodetilus_score) {
      console.log('new winner', repo.id);
      topTen[i] = repo;
      updated = true;
      break;
    }
  }
  return updated;
};

app.get('/api/repo', function(req, res) {
  var repo_content = {};
  var repo_url = req.query.repo_url ? req.query.repo_url : '';

  if (repo_url) {
    gitHubHandler.getPackagesFromURL(repo_url)
      .then((repo) => {
        repo_content = repo;
        
        console.log('\n\nMY packages:', repo_content.packages);

        query = "SELECT * FROM metadata where packages != '{}'";
        db.all(query, function(err, results) {
          var matches = [];
          topTen = [];

          results.map((repo) => {
            var repo_packages = JSON.parse(repo.packages);

            var percentages = nodetilus.getPercentages(repo_content.packages, repo_packages)

            repo['matches_percentage'] = percentages.matches_percentage;
            repo['density_percentage'] = percentages.density_percentage;
            repo['nodetilus_score'] = percentages.nodetilus_score;

            if( fightAPlace(repo) ) {
              console.log('project added', repo.id, topTen.length);
            }
          });
          
          var promises = [];

          topTen.map((winner) => {  
            promises.push(dbHandler.getRepoInfo(winner.repo_id));
          });

          when.all(promises)
            .then(function(data){

              data.map((mint) => {

               matches.push({
                 full_name: mint.full_name,
                 html_url: mint.html_url
               });

              })
              res.send(matches);
            })
            .otherwise((err) => {
              console.log(err);
              res.send(err);
            })

        });

        
      })
      .otherwise((err) => {
        console.log('err', err);
        res.send(err);
      });
  
    
  } else {
    res.send('URL please...');
  }

});

app.get('/api/repo/search', (req, res) => {
  const url = 'https://github.com/nko5/nodetilus';
  gitHubHandler.getPackagesFromURL(url)
    .then((repo) => {
      console.log('repo', repo);
      res.send(repo);
    })
    .otherwise((err) => {
      console.log('err', err);
      res.send(err);
    });
});


var port = 8080;
app.listen(port);
console.log('Express server started on port %s', port);
