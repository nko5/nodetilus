const sqlite3 = require('sqlite3').verbose(); 
const when = require('when');
const _ = require('lodash');

function dbHandler() {
  const db = new sqlite3.Database('db.sqlite');
  const query = {
    run: function(sql) {
      return when.promise(function(resolve, reject, notify) {
        db.run(sql, function(err) {
          if(err) {
            reject(err);
          }
          resolve(this.lastID, this.changes);
        });
      });
    },

    get: function(sql) {
      return when.promise(function(resolve, reject, notify) {
        db.get(sql, function(err, row) {
          if(err) {
            reject(err);
          }
          resolve(row);
        });
      });
    }
  };

  var getQuery = function(sql, type) {
    return when.promise(function(resolve, reject, notify) {
      if( !type || type === 'run' ) {
        db.run(sql, function(err) {
          if(err) {
            reject(err);
          }
          resolve(this.lastID, this.changes);
        });    
      }
      else if( type === 'get' ) {
        db.get(sql, function(err, row) {
          if(err) {
            reject(err);
          }
          resolve(row);
        }); 
      }
    });
  }

  return {
    createTables: function() {
      var promises = [];
      promises.push(query.run("CREATE TABLE repo (id integer primary key autoincrement, full_name TEXT, description TEXT, html_url TEXT, languages_url TEXT, stargazers_count TEXT, watchers_count TEXT, language TEXT, forks_count TEXT, default_branch TEXT, score TEXT)"));
      promises.push(query.run("CREATE TABLE metadata (id integer primary key autoincrement, repo_id integer, keywords TEXT, packages TEXT)"));
      return when.all(promises);
    },

    dropTables: function() {
      var promises = [];
      promises.push(query.run("DROP TABLE repo"));
      promises.push(query.run("DROP TABLE metadata"));
      return when.all(promises);
    },

    isRepoAlreadyRegistered: function(repoName) {
      return query.get("SELECT id FROM repo where full_name = '" + repoName + "'");
    },

    saveRepo: function(repo) {
      return query.run("INSERT INTO repo VALUES (NULL, '" + repo.full_name + "', '" + repo.description +"', '" + repo.html_url +"', '" + repo.languages_url +"', '" + repo.stargazers_count +"', '" + repo.watchers_count + "', '" + repo.language +"', '" + repo.forks_count + "', '" + repo.default_branch +"', '" + repo.score + "')");
    },

    saveRepoPackages: function(repoID, package) {
      const packages = _.merge({}, package.devDependencies, package.dependencies);
      return query.run("INSERT INTO metadata VALUES (NULL, " + repoID + ", '" + JSON.stringify(package.keywords) + "', '" + JSON.stringify(packages) +"')");
    }
  
  };
};

module.exports = dbHandler;