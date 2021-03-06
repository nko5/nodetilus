const dbHandler = require('./scripts/dbHandler')();
const gitHubHandler = require('./scripts/gitHubHandler')();

function crone(page) {
  gitHubHandler.getReposFromSource(page)
    .then((repos) => {

      repos.map((repo) => {

        dbHandler.isRepoAlreadyRegistered(repo.full_name)
          .then((flag) => {
            if(!flag) {
              dbHandler.saveRepo(repo)
                .then((repoID) => {
                  repo.id = repoID;

                    setTimeout(() => {
                      gitHubHandler.getPackageFromRepo(repo)
                        .then((repoPackage) => {

                          dbHandler.saveRepoPackages(repo.id, repoPackage)
                            .then((packageID) => {
                              console.log(['[', repo.id, '] ', repo.full_name, '; packages added with ID:', packageID].join(''));
                            })
                            .otherwise((err) => {
                              console.log('5 err', err);
                            }); // saveRepoPackages

                        })
                        .otherwise((err) => {
                          console.log('4 err', err);
                        }); // getPackageFromRepo

                    }, 500); // setTimeout

                })
                .otherwise((err) => {
                  console.log('3 err', err);
                });  // saveRepo
            } // if !flag
            else {
              console.log(repo.full_name + ' already registered');  
            }

          })
          .otherwise((err) => {
            console.log('2 err', err);
          }); // isRepoAlreadyRegistered

      });

    }) // getReposFromSource
    .otherwise((err) => {
      console.log('1 err', err);
    });
}

for(var i=1, len=11; i<len; i++) {
  ((page) => {
    setTimeout(() => {
      crone(page);  
    }, 300);
  })(i);
}

