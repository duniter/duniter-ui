"use strict";

var co = require('co');
var conf = require('js/lib/conf/conf');

module.exports = ($scope, $http, $state, Webmin) => {

  $scope.generated = '';
  $scope.started = false;
  $scope.message = 'configuration.create_root.need_a_try';

  $scope.start = () => co(function *() {
    try {
      let hosts = [];
      if ($scope.$parent.conf.remote_ipv4) {
        hosts.push([$scope.$parent.conf.remote_ipv4, $scope.$parent.conf.rport].join(':'));
      }
      if ($scope.$parent.conf.remote_ipv6) {
        hosts.push(["[" + $scope.$parent.conf.remote_ipv6 + "]", $scope.$parent.conf.rport].join(':'));
      }
      $scope.host_listening = hosts.join('\n');
      $scope.started = true;
      yield Webmin.server.sendConf({
        conf: $scope.$parent.conf
      });
      yield $scope.try();
    } catch (e) {
      $scope.message = e.message;
    }
  });

  $scope.stop = () => co(function *() {
    $scope.started = false;
  });

  $scope.try = () => co(function *() {
    try {
      $scope.block = yield Webmin.server.previewNext();
      $scope.generated = $scope.block.raw;
      $scope.message = '';
    } catch (e) {
      $scope.message = e.message;
    }
  });

  $scope.accept = () => co(function *() {
    let res = yield Webmin.blockchain.block_add({
      block: $scope.generated
    });
    if (res.number == 0) {
      // We successfully started the blockchain
      yield $scope.startServices();
    }
  });

  $scope.startServices = () => co(function *() {
    yield Webmin.server.services.startAll();
    $state.go('index');
  });

  $scope.cancelAndReset = () => co(function *() {
    yield Webmin.server.services.stopAll();
    yield Webmin.server.resetData();
    $state.go('index');
  });

  return co(function *() {
    try {
      yield $scope.start();
      yield $scope.try();
      $scope.started = true;
    } catch (e) {
      $scope.started = false;
    }
  });
};
