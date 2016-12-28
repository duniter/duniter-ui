"use strict";

var co = require('co');
var Peer = require('js/lib/entity/peer');

module.exports = ($scope, $http, $state, Webmin, peers) => {

  $scope.peers = peers.map((peer) => {
    let p = new Peer(peer);
    return {
      name: [p.getURL(), "(" + p.pubkey.slice(0, 6) + ")"].join(' '),
      host_port: [p.getHost(), p.getPort()].join('|')
    }
  });

  $scope.resetNode = () => {
    $('#modalReset').openModal();
  };

  $scope.resetNodeAndSync = () => co(function *() {
    yield Webmin.server.http.stop();
    yield Webmin.server.services.stopAll();
    yield Webmin.server.resetData();
    let sp = $scope.remote_host.split('|');
    $state.go('sync', {
      host: sp[0],
      port: sp[1],
      sync: true
    })
  });
};
