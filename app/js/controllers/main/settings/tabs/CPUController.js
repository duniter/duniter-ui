"use strict";

const co = require('co');

module.exports = ($scope, $http, $state, $timeout, UIUtils, summary, Webmin) => {

  $scope.cpuPower = parseInt(summary.conf.cpu * 100);

  $scope.updateCPUpower = () => co(function *() {
    $scope.savingCPU = true;
    yield Webmin.server.cpuConf({
      cpu: parseFloat(($scope.cpuPower / 100).toFixed(2))
    });
    UIUtils.toast('settings.cpu.saved');
    $scope.savingCPU = false;
  });
};
