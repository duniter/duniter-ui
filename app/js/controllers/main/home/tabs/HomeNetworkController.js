"use strict";

module.exports = ($scope, Webmin, peers) => {

  $scope.peers = peers.peers;

  const co = require('co');

  $scope.update = () => co(function *() {
    $scope.searching = true;
    let delayP = Q.delay(500);
    $scope.peers = (yield Webmin.network.peers()).peers;
    yield delayP;
    $scope.searching = false;
    $scope.$apply();
  });
};
