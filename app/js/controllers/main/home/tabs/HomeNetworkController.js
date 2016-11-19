"use strict";

module.exports = ($scope, BMA, peers, summary) => {

  $scope.peers = peers.peers;

  const co = require('co');

  $scope.update = () => co(function *() {
    $scope.searching = true;
    let delayP = Q.delay(500);
    $scope.peers = (yield BMA(summary.host).network.peers()).peers;
    yield delayP;
    $scope.searching = false;
    $scope.$apply();
  });
};
