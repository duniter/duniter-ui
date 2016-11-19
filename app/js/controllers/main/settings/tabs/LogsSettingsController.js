"use strict";

const co = require('co');

module.exports = ($scope, Webmin) => {
  
  $scope.generating = false;
  $scope.error = '';

  $scope.shareLogs = () => co(function*() {
    if (!$scope.generating) {
      try {
        $scope.error = '';
        $scope.generating = true;
        const res = yield Webmin.logsExport(2000);
        $scope.link = res.link;
      } catch (e) {
        $scope.error = (e && e.message) || e || 'Unknown error';
      }
      $scope.generating = false;
    }
  });
};
