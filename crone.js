const rest = require('rest');
const mime = require('rest/interceptor/mime');
const errorCode = require('rest/interceptor/errorCode');

var dbHandler = require('./scripts/dbHandler')();


const gitHubHandler = require('./scripts/gitHubHandler')();

function crone(page) {
  gitHubHandler.getReposFromSource(page)
    .then(function(repos) {

      repos.map((repo) => {

        dbHandler.isRepoAlreadyRegistered(repo.full_name)
          .then(() => {

            dbHandler.saveRepo(repo)
              .then((repoID) => {

                console.log(repo.full_name, 'new record', repoID);

                gitHubHandler.getPackageFromRepo(repo)
                  .then((package) => {

                    dbHandler.saveRepoPackages(repoID, package)
                      .then((packageID) => {
                        console.log(repo.full_name, '[', repoID, ']; packages added; ID', packageID);
                      })
                      .otherwise((err) => {
                        console.log('5 err', err);
                      }); // saveRepoPackages

                  })
                  .otherwise((err) => {
                    console.log('4 err', err);
                  }); // getPackageFromRepo

              })
              .otherwise((err) => {
                console.log('3 err', err);
              });  // saveRepo

          })
          .otherwise((err) => {
            var msg = (!err) ? repo.full_name + ' already registered' : err;
            console.log('2 err', msg);
          }); // isRepoAlreadyRegistered

      });

    }) // getReposFromSource
    .otherwise(function(err) {
      console.log('1 err', err);
    });
}

crone(1);


console.log('end');
