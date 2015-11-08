const _ = require('lodash');

function nodetilus() {

  return {
    getPercentages: function(base_repo_packages, second_repo_packages) {
      var total_matches = 0;
      var matches_percentage = 0;
      var density_percentage = 0;
      var base_repo_packages_count = Object.keys(base_repo_packages).length;
      var second_repo_packages_count = Object.keys(second_repo_packages).length;

      for (var package in base_repo_packages) {
        if(second_repo_packages.hasOwnProperty(package)){
          total_matches++;
        }
      }

      matches_percentage = total_matches ? (total_matches/base_repo_packages_count)*100 : 0;
      density_percentage = total_matches ? (total_matches/second_repo_packages_count)*100 : 0;

      return {
        matches_percentage: Math.round(matches_percentage),
        density_percentage: Math.round(density_percentage)
      }
    },

  }
};

module.exports = nodetilus;
