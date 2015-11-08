const sqlite3 = require('sqlite3').verbose(); 
const when = require('when');

function dbHandler() {
  const db = new sqlite3.Database('db.sqlite');
  var query;

  return {
    createTablaes: function() {
      query = "CREATE TABLE repo (id integer primary key autoincrement, full_name TEXT, description TEXT, html_url TEXT, languages_url TEXT, stargazers_count TEXT, watchers_count TEXT, language TEXT, forks_count TEXT, default_branch TEXT, score TEXT)";
      db.run(query);

      query = "CREATE TABLE metadata (id integer primary key autoincrement, repo_id integer, keywords TEXT, devDependencies TEXT, dependencies TEXT)";
      db.run(query);
    },

    isRepoAlreadyRegistered: function(repoName) {
      query = "SELECT id FROM repo where full_name = '" + repoName + "'";

      return when.promise((resolve, reject, notify) => {
        db.get(query, (err, row) => {
          if(err || row) {
            reject();
          }
          resolve();
        });
      });
    },

    saveRepo: function(repo) {
      query = "INSERT INTO repo VALUES (NULL, '" + repo.full_name + "', '" + repo.description +"', '" + repo.html_url +"', '" + repo.languages_url +"', '" + repo.stargazers_count +"', '" + repo.watchers_count + "', '" + repo.language +"', '" + repo.forks_count + "', '" + repo.default_branch +"', '" + repo.score + "')";

      return when.promise(function(resolve, reject, notify) {
        db.run(query, function(err) {
          if(err) {
            reject(err);
          }
          resolve(this.lastID);
        });
      });
    },

    saveRepoPackages: function(repoID, package) {
      query = "INSERT INTO metadata VALUES (NULL, " + repoID + ", '" + JSON.stringify(package.keywords) + "', '" + JSON.stringify(package.devDependencies) +"', '" + JSON.stringify(package.dependencies) + "')";

      return when.promise(function(resolve, reject, notify) {
        db.run(query, function(err) {
          if(err) {
            reject(err);
          }
          resolve(this.lastID);
        });
      });
    }
  
  };
};

module.exports = dbHandler;