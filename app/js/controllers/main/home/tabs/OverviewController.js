"use strict";

module.exports = ($scope, $interval, Webmin, UIUtils, summary, ws) => {

  let co = require('co');
  let moment = require('moment');

  bindBlockWS(() => {
    $scope.loadPowData();
  });
  let M = summary.current.monetaryMass || 0;
  // const nbUDperYear = Math.ceil(365.25 * 3600 * 24 / summary.parameters.dt);
  // const globalC = Math.round(Math.pow(1 + summary.parameters.c, nbUDperYear) * 100) / 100 - 1;
  let UD = summary.parameters.ud0;
  if (summary.lastUDBlock) {
    const N = summary.current.membersCount;
    UD = parseInt((summary.lastUDBlock.dividend * Math.pow(10, summary.lastUDBlock.unitbase) + Math.pow(summary.parameters.c, 2) * M / N).toFixed(0));
  }
  $scope.current = summary.current;
  $scope.current_currency = summary.current.currency;
  $scope.current_number = summary.current.number;
  $scope.current_membersCount = summary.current.membersCount;
  $scope.current_medianTime = summary.current.medianTime;
  $scope.current_powMin = summary.current.powMin;
  $scope.monetaryMass = parseInt(M / UD) || 0;
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
    let res = yield Webmin.powSummary();
    $scope.pow_total = res.total;
    $scope.pow_mirror = res.mirror;
    $scope.pow_waiting = res.waiting;
  });

  ws.on(undefined, (data) => {
    if (data.type === 'started') {
      $scope.server_started = true;
      $scope.server_stopped = false;
      bindBlockWS(() => {
        $scope.loadPowData();
      });
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
    Webmin.wsBlock().on(undefined, (block) => {
      $scope.current_currency = block.currency;
      $scope.current_number = block.number;
      $scope.current_membersCount = block.membersCount;
      $scope.current_medianTime = block.medianTime;
      $scope.current_powMin = block.powMin;
      let M = summary.current.monetaryMass || 0;
      let UD = summary.parameters.ud0;
      if (summary.lastUDBlock) {
        const N = summary.current.membersCount;
        UD = parseInt(Math.round(summary.lastUDBlock.dividend * Math.pow(10, summary.lastUDBlock.unitbase) + Math.pow(summary.parameters.c, 2) * M / N).toFixed(0));
      }
      $scope.monetaryMass = parseInt(M / UD) || 0;
      $scope.$apply();
      cb && cb();
    });
  }
  
  $scope.reconfigure_network = () => co(function *() {
    $scope.reconfiguring = true;
    let delay = Q.delay(1000);
    try {
      let netinferfaces = yield Webmin.network.interfaces();
      let conf = {};
      conf.local_ipv4 = netinferfaces.auto.local.ipv4 || '';
      conf.local_ipv6 = netinferfaces.auto.local.ipv6 || '';
      conf.remote_ipv4 = netinferfaces.auto.remote.ipv4 || '';
      conf.remote_ipv6 = netinferfaces.auto.remote.ipv6 || '';
      conf.lport = netinferfaces.auto.local.port || 9330;
      conf.rport = netinferfaces.auto.remote.port || 9330;
      conf.upnp = netinferfaces.auto.remote.upnp || false;
      conf.dns = netinferfaces.auto.remote.dns || '';
      yield Webmin.server.netConf({
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
      yield $scope.loadPowData();
      const reachable = yield Webmin.isNodePubliclyReachable();
      if (!reachable || !reachable.success) {
        $scope.should_reconfigure = true;
      }
    } catch (e) {
      console.log(e);
    }
  });
};
