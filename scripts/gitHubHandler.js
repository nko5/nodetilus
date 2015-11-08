const clientREST = require('./clientREST');
const when = require('when');
const _ = require('lodash');

function gitHubHandler() {
  const URL = {
    generic: 'https://api.github.com/',
    content: 'https://raw.githubusercontent.com/'
  };
  const headers = {
    'User-Agent': 'garciadiazjaime'
  };
  const tag = 'javascript';
  const lang = 'Javascript'
  const perPage = 100;

  const formatRepoResponse = function(items) {
    var response = [];
    items.map((item, i) => {
      if(!item.private) {
        response.push({
          full_name: item.full_name,
          description: item.description ? item.description.replace(/'/g, '') : '',
          html_url: item.html_url,
          languages_url: item.languages_url,
          stargazers_count: item.stargazers_count,
          watchers_count: item.watchers_count,
          language: item.language,
          forks_count: item.forks_count,
          default_branch: item.default_branch,
          score: item.score
        });
      }
    });
    return response;
  };

  const formatPackageResponse = function(data) {
    try {
      // data = typeof data === 'string' ? JSON.stringify(eval("(" + data + ")")) : data;
      data = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        keywords: data.keywords || [],
        devDependencies: data.devDependencies || {},
        dependencies: data.dependencies || {}
      };
    }
    catch(e) {
      console.log('==== EXCEPTION', e, typeof data, data);
    }
  };

  return {
    getReposFromSource: function(page) {
      const path = [URL.generic, 'search/repositories?q=', tag, '+language:', lang, '&sort=stars&order=desc&per_page=', perPage, '&page=', page].join('');

      return when.promise((resolve, reject, notify) => {
        clientREST({ 
            path: path,
            headers: headers
          }).then(
          (response) => {
            resolve(formatRepoResponse(response.entity.items));
          },
          (errs) => {
            reject(errs);
          }
        );
      });
    },

    getPackageFromRepo: function(repo) {
      const path = [URL.content, repo.full_name, '/', repo.default_branch, '/', 'package.json'].join('');

      return when.promise((resolve, reject, notify) => {
        
        clientREST({ 
            path: path,
            headers: headers
          }).then(
          (response) => {

            if(response.entity === 'Not Found') {
              console.log('Not Found', response.request.path);
              reject(response.entity);
            }
            else{
              resolve(formatPackageResponse(response.entity));  
            }
          },
          (errs) => {
            reject(errs);
          }
        );

      });

    },

    getPackagesFromURL: function(url) {
      const bits = url.split('/').reverse();
      const path = ['https://api.github.com/repos/', bits[1], '/', bits[0] ].join('');
      
      return when.promise((resolve, reject, notify) => {
        clientREST({ 
            path: path,
            headers: headers
          }).then(
          (response) => {
            if(response.entity === 'Not Found') {
              console.log('Not Found', response.request.path);
              reject(response.entity);
            }
            else{
              const repo = formatRepoResponse([response.entity])[0];
              this.getPackageFromRepo(repo)
                .then((repoPackage) => {
                  repo.keywords = repoPackage.keywords;
                  repo.packages = _.merge({}, repoPackage.devDependencies, repoPackage.dependencies);
                  resolve(repo);
                })
                .otherwise((err) => {
                  console.log('1 err', err);
                  reject(err);
                });
            }
          },
          (errs) => {
            reject(errs);
          }
        );

      });
    }


  };
};

module.exports = gitHubHandler;