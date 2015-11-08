var express = require('express');
var app = express();

//Create a static file server
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

// //Get the dummy data
// require('./server/ddata.js');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

app.get('/api/repo', function(req, res) {
  query = "SELECT * FROM repo LIMIT 10";
  db.all(query, function(err, results) {
  	results.map((repo) => {
  		repo['percentage_similarity'] = Math.floor((Math.random() * 100) + 1);
  		repo['percentage_density'] = Math.floor((Math.random() * 100) + 1);
  	})
    res.send(results);
  });
});


var port = 8080;
app.listen(port);
console.log('Express server started on port %s', port);
