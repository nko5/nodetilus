var express = require('express');
var app = express();

//Create a static file server
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

// //Get the dummy data
// require('./server/ddata.js');

const gitHubHandler = require('./scripts/gitHubHandler')();
const nodetilus = require('./scripts/nodetilus')();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

const topTen = [];

const fightAPlace = function(repo) {
	// nodetilus_score
	if(topTen.length < 10 ) {
		topTen.push(repo);
		return true;
	}

	var updated = false;
	for(var i=0, len=topTen.length; i<len; i++) {
		if(repo.nodetilus_score > topTen[i].nodetilus_score) {
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
	    	console.log('============================================================');
				console.log('MY packages:', repo_content.packages);

			  query = "SELECT * FROM metadata where packages != '{}' LIMIT 10";
			  db.all(query, function(err, results) {
			  	var matches = {};

			  	results.map((repo) => {
			  		var repo_packages = JSON.parse(repo.packages);

			  		var percentages = nodetilus.getPercentages(repo_content.packages, repo_packages)

			  		repo['similarity_percentage'] = percentages.similarity_percentage;
			  		repo['density_percentage'] = percentages.density_percentage;

			  		if( fightAPlace(repo) ) {
			  			console.log('project added', repo);
			  		}
			  	})
			    
			    console.log('============================================================');
			    console.log('RESULTS: ', results);
					res.send(results);
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
