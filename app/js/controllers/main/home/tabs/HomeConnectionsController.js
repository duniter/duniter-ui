"use strict";

module.exports = ($scope, Webmin, heads, info, conf, ws) => {
  
  $scope.discriminateNodes = (info) => {
    info.connections.level1.concat(info.connections.level2).forEach(c => {
      c.prefered = (conf.preferedNodes || []).indexOf(c.pubkey) !== -1
      c.privileged = (conf.privilegedNodes || []).indexOf(c.pubkey) !== -1
    })
    return info
  }

  $scope.info = $scope.discriminateNodes(info);
  $scope.heads = []

  const headsMap = {}

  $scope.headsIntoMap = (heads) => {
    for (const value of heads) {
      const sp = value.message.split(':')
      let api = sp[0]
      let pubkey = sp[3]
      let blockstamp = sp[4]
      let ws2pId = sp[5]
      let software = sp[6]
      let softVersion = sp[7]
      let prefix = sp[8]
      let uid = value.uid
      let freeRooms = ""
      let step = ""
      // Gestion des anciens formats
      console.log(value.message)
      if (value.messageV2 && value.messageV2.match(/:2:/)) {
        // HEAD V2
        freeRooms = value.freeRooms
        step = value.step
      }
      else if (value.message.match(/:1:/)) {
        // HEAD v1
      }
      else {
        // HEAD v0
        pubkey = sp[2]
        blockstamp = sp[3]
      }
      let ws2pFullId = pubkey+"-"+ws2pId
      headsMap[ws2pFullId] = {
        api, blockstamp, uid, ws2pId, software, softVersion, prefix, freeRooms, step
      }
    }
    $scope.heads = Object.keys(headsMap).map(k => {
      return {
        pubkey: k,
        api: headsMap[k].api,
        uid: headsMap[k].uid,
        blockstamp: headsMap[k].blockstamp,
        ws2pId: headsMap[k].ws2pId,
        software: headsMap[k].software,
        softVersion: headsMap[k].softVersion,
        prefix: headsMap[k].prefix,
        freeRooms: headsMap[k].freeRooms,
        step: headsMap[k].step
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
        $scope.info = $scope.discriminateNodes(yield Webmin.network.ws2p.info())
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