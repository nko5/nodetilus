const rest = require('rest');
const mime = require('rest/interceptor/mime');
const errorCode = require('rest/interceptor/errorCode');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');


const url = 'https://api.github.com/search/repositories?q=javascript+language:JavaScript&sort=stars&order=desc'


const client = rest.wrap(mime).wrap(errorCode, { code: 500 });

const conf = { 
  path: url,
  headers: {
    'User-Agent': 'garciadiazjaime'
  }
};

client(conf).then(
  (response) => {
    const items = response.entity.items;
    items.map((item, i) => {
      if(!item.private){
        const repo = {
          full_name: item.full_name,
          description: item.description,
          html_url: item.html_url,
          languages_url: item.languages_url,
          stargazers_count: item.stargazers_count,
          watchers_count: item.watchers_count,
          language: item.language,
          forks_count: item.forks_count,
          default_branch: item.default_branch,
          score: item.score
        };
        // console.log(repo);

        const url_package = ['https://raw.githubusercontent.com/', repo.full_name, '/', repo.default_branch, '/', 'package.json'];
        // console.log('url_package', url_package.join(''));

        db.serialize(function() {
          var query;
          // query = "CREATE TABLE repo (id integer primary key autoincrement, full_name TEXT, description TEXT, html_url TEXT, languages_url TEXT, stargazers_count TEXT, watchers_count TEXT, language TEXT, forks_count TEXT, default_branch TEXT, score TEXT)";
          // db.run(query);

          // query = "CREATE TABLE metadata (id integer primary key autoincrement, repo_id integer, keywords TEXT, devDependencies TEXT, dependencies TEXT)";
          // db.run(query);

          query = "SELECT id FROM repo where full_name = '" + repo.full_name + "'";
          db.get(query, function(err, row) {
            if(!row) {
              query = "INSERT INTO repo VALUES (NULL, '" + repo.full_name + "', '" + repo.description +"', '" + repo.html_url +"', '" + repo.languages_url +"', '" + repo.stargazers_count +"', '" + repo.watchers_count + "', '" + repo.language +"', '" + repo.forks_count + "', '" + repo.default_branch +"', '" + repo.score + "')";
              db.run(query, function(err){
                const repoID = this.lastID;
                console.log('lastID', this.lastID);
                const conf_child = {
                  path: url_package.join(''),
                  headers: {
                    'User-Agent': 'garciadiazjaime'
                  }
                };
                client(conf_child).then(
                  (response) => {
                    const data = JSON.parse(response.entity);
                    const repo_package = {
                      keywords: data.keywords || [],
                      devDependencies: data.devDependencies || {},
                      dependencies: data.dependencies || {}
                    };
                    // console.log(repo_package);

                    query = "INSERT INTO metadata VALUES (NULL, " + repoID + ", '" + JSON.stringify(repo_package.keywords) + "', '" + JSON.stringify(repo_package.devDependencies) +"', '" + JSON.stringify(repo_package.dependencies) + "')";
                    db.run(query, function(err) {
                      console.log('lastID', this.lastID);
                    })
                  },
                  (response) => {
                    console.error('response error [child]: ', response);
                  }
                );

              });
            }
          });

          // query = "SELECT * FROM repo";
          // db.each(query, function(err, row) {
          //   console.log(row);
          // });
        });

        // db.close();
        console.log('\n');
      }
    });
  },
  (response) => {
    console.error('response error: ', response);
  }
);