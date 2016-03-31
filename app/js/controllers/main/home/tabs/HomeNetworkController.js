"use strict";

module.exports = ($scope, bmapi, peers) => {

  $scope.peers = peers.peers;

  var co = require('co');

  $scope.update = () => co(function *() {
    $scope.searching = true;
    let delayP = Q.delay(500);
    $scope.peers = (yield bmapi.network.peers()).peers;
    yield delayP;
    $scope.searching = false;
    $scope.$apply();
  });
};
