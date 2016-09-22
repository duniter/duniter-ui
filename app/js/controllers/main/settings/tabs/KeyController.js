"use strict";

var co = require('co');

module.exports = ($scope, $state, BMA, summary, PubkeyGenerator) => {

  $scope.pubkey = summary.pubkey;

  setTimeout(() => {
    $('select').material_select();
  }, 500);

  $scope.accept = () => co(function *() {
    yield BMA.webmin.server.keyConf({
      conf: $scope.$parent.conf
    });
    $scope.$parent.conf.idty_entropy = '';
    $scope.$parent.conf.idty_password = '';
    $state.reload();
    $scope.restartServer();
  });

  PubkeyGenerator($scope);
};
