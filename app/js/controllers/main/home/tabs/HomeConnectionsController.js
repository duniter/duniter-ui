"use strict";

module.exports = ($scope, Webmin, heads, info, ws) => {

  $scope.info = info;
  $scope.heads = []

  const headsMap = {}

  $scope.headsIntoMap = (heads) => {
    for (const value of heads) {
      const sp = value.message.split(':')
      const pubkey = sp[2]
      const blockstamp = sp[3]
      const uid = value.uid
      headsMap[pubkey] = {
        blockstamp, uid
      }
    }
    $scope.heads = Object.keys(headsMap).map(k => {
      return {
        pubkey: k,
        uid: headsMap[k].uid,
        blockstamp: headsMap[k].blockstamp
      }
    })
  }

  $scope.headsIntoMap(heads)

  ws.on('ws2p', (obj) => co(function*() {
    if (obj.value.ws2p === 'heads') {
      $scope.headsIntoMap(obj.value.added)
    }
    else if (obj.value.ws2p === 'connected' || obj.value.ws2p === 'disconnected') {
      co(function*() {
        $scope.info = yield Webmin.network.ws2p.info()
      })
    }
    $scope.$apply()
  }))

  const co = require('co');

  $scope.update = () => co(function *() {
    $scope.searching = true;
    let delayP = Q.delay(500);
    $scope.peers = (yield Webmin.network.peers()).peers;
    yield delayP;
    $scope.searching = false;
    $scope.$apply();
  });
}