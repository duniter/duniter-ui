"use strict";

module.exports = ($scope, Webmin, heads, info, ws) => {

  $scope.info = info;
  $scope.heads = []

  const headsMap = {}

  $scope.headsIntoMap = (heads) => {
    for (const value of heads) {
      const sp = value.message.split(':')
      let pubkey = sp[3]
      let blockstamp = sp[4]
      let ws2pId = sp[5]
      let software = sp[6]
      let softVersion = sp[7]
      let prefix = sp[8]
      let uid = value.uid
      // Gestion de l'ancien format
      console.log(value.message)
      if (!value.message.match(/:1:/)) {
        pubkey = sp[2]
        blockstamp = sp[3]
        uid = value.uid
      }
      let ws2pFullId = pubkey+"-"+ws2pId
      headsMap[ws2pFullId] = {
        blockstamp, uid, ws2pId, software, softVersion, prefix
      }
    }
    $scope.heads = Object.keys(headsMap).map(k => {
      return {
        pubkey: k,
        uid: headsMap[k].uid,
        blockstamp: headsMap[k].blockstamp,
        ws2pId: headsMap[k].ws2pId,
        software: headsMap[k].software,
        softVersion: headsMap[k].softVersion,
        prefix: headsMap[k].prefix
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