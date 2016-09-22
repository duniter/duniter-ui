"use strict";

module.exports = ($scope, $interval, BMA, UIUtils, summary, bmapi, ws) => {

  let co = require('co');
  let moment = require('moment');

  bindBlockWS(() => {
    $scope.loadPowData();
  });
  const UD = summary.parameters.c * summary.current.monetaryMass / summary.current.membersCount;
  $scope.current = summary.current;
  $scope.monetaryMass = parseInt(summary.current.monetaryMass / UD);
  $scope.server_started = true;
  $scope.server_stopped = false;
  $scope.phones = [];
  $scope.abc = 'abcdef';
  $scope.newIdentities = 2;

  $(".dropdown-button").dropdown({ constrainwidth: false });

  $scope.lastNearPoW = '';
  $scope.totalPoW = '...';
  $scope.sync_state = 'home.pulling.state.unkown';
  $scope.network_percent = 0;
  $scope.peer_percent = 0;
  $scope.has_pulled = false;
  $scope.is_pulling = false;
  $scope.last_pulling = 0;
  let start_block = 0;

  $interval(() => {
    if ($scope.last_pulling) {
      $scope.sync_state = $scope.is_pulling ? 'home.pulling.state.syncing' : 'home.pulling.state.synced';
      $scope.sync_time = moment($scope.last_pulling).fromNow();
    }
  }, 1000);

  $scope.loadPowData = () => co(function*() {
    let res = yield BMA.webmin.powSummary();
    $scope.pow_total = res.total;
    $scope.pow_mirror = res.mirror;
    $scope.pow_waiting = res.waiting;
  });

  ws.on(undefined, (data) => {
    if (data.type === 'started') {
      $scope.server_started = true;
      $scope.server_stopped = false;
      bindBlockWS();
      UIUtils.toast('general.server.started');
      $scope.$apply();
    }
    if (data.type === 'stopped') {
      $scope.server_stopped = true;
      $scope.server_started = false;
      UIUtils.toast('general.server.stopped');
      $scope.$apply();
    }
    if (data.type === 'pulling') {
      $scope.is_pulling = true;
      $scope.has_pulled = true;
      const event = data.value;
      if (($scope.last_pulling && event.type === 'start') || (!$scope.last_pulling && event.type !== 'end')) {
        $scope.last_pulling = moment();
      }
      if (event.type === 'peer') {
        $scope.network_percent = parseInt((event.data.number + 1) / event.data.length * 100);
        $scope.peer_percent = 100;
        start_block = 0;
      }
      if (event.type === 'applying') {
        if (!start_block) {
          start_block = event.data.number;
        }
        const total = event.data.last - start_block;
        const doneCount = event.data.number - start_block;
        $scope.peer_percent = parseInt(doneCount / total * 100);
      }
      if (event.type === 'end') {
        $scope.is_pulling = false;
        $scope.network_percent = 0;
        $scope.peer_percent = 0;
        start_block = 0;
      }
    }
    if (data.type === 'pow') {
      const pow = data.value;
      if (pow.found) {
        $scope.pow_waiting = true;
        $scope.lastNearPoW = '#' + pow.hash;
        $scope.$apply();
      } else {
        $scope.pow_waiting = false;
        $scope.lastNearPoW = '#' + pow.hash;
        $scope.$apply();
      }
    }
  });

  function bindBlockWS(cb) {
    BMA.websocket.block().on(undefined, (block) => {
      $scope.current = block;
      $scope.$apply();
      cb && cb();
    });
  }
  
  $scope.reconfigure_network = () => co(function *() {
    $scope.reconfiguring = true;
    let delay = Q.delay(1000);
    try {
      let netinferfaces = yield BMA.webmin.network.interfaces();
      let conf = {};
      conf.local_ipv4 = netinferfaces.auto.local.ipv4 || '';
      conf.local_ipv6 = netinferfaces.auto.local.ipv6 || '';
      conf.remote_ipv4 = netinferfaces.auto.remote.ipv4 || '';
      conf.remote_ipv6 = netinferfaces.auto.remote.ipv6 || '';
      conf.lport = netinferfaces.auto.local.port || 9330;
      conf.rport = netinferfaces.auto.remote.port || 9330;
      conf.upnp = netinferfaces.auto.remote.upnp || false;
      conf.dns = netinferfaces.auto.remote.dns || '';
      yield BMA.webmin.server.netConf({
        conf: conf
      });
      yield delay;
      $scope.should_reconfigure = false;
      UIUtils.toast('general.network.reconf_ok');
      $scope.$apply();
    } catch (e) {
      yield delay;
      $scope.reconfiguring = false;
      $scope.$apply();
    }
  });

  return co(function *() {
    yield $scope.startServer();
    try {
      yield [
        bmapi.origin.network.peering.self(),
        $scope.loadPowData()
      ];
    } catch (e) {
      console.log(e);
      $scope.should_reconfigure = true;
    }
  });
};
