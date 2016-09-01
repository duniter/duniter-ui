var co = require('co');
var _ = require('underscore');
var conf = require('../lib/conf/conf');

module.exports = (angular) => {

  angular.module('duniter.services', ['ngResource'])

    .factory('BMA', function($http, $q) {

      function httpProtocol() {
        return window.location.protocol + '//';
      }

      function wsProtocol() {
        return window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      }

      function BMA(server) {

        function getResource(uri, protocol) {
          return function(params) {
            return $q.when(httpGet(uri, params, protocol));
          }
        }

        function httpGet(uri, params, protocol) {
          return Q.Promise((resolve, reject) => {
            var config = {
              timeout: conf.api_timeout
            }, suffix = '', pkeys = [], queryParams = null;
            if (typeof params == 'object') {
              pkeys = _.keys(params);
              queryParams = {};
            }
            pkeys.forEach(function(pkey){
              var prevURI = uri;
              uri = uri.replace(new RegExp(':' + pkey), params[pkey]);
              if (prevURI == uri) {
                queryParams[pkey] = params[pkey];
              }
            });
            config.params = queryParams;
            $http.get((protocol || httpProtocol()) + server + uri + suffix, config)
              .success(function(data, status, headers, config) {
                resolve(data);
              })
              .error(function(data, status, headers, config) {
                console.log(data);
                reject(data);
              });
          });
        }

        function postResource(uri) {
          return function(data, params) {
            return $q.when(Q.Promise((resolve, reject) => {
              var config = {
                timeout: 4000
              }, suffix = '', pkeys = [], queryParams = null;
              if (typeof params == 'object') {
                pkeys = _.keys(params);
                queryParams = {};
              }
              pkeys.forEach(function(pkey){
                var prevURI = uri;
                uri = uri.replace(new RegExp(':' + pkey), params[pkey]);
                if (prevURI == uri) {
                  queryParams[pkey] = params[pkey];
                }
              });
              config.params = queryParams;
              $http.post(httpProtocol() + server + uri + suffix, data, config)
                .success(function(data, status, headers, config) {
                  resolve(data);
                })
                .error(function(data, status, headers, config) {
                  reject(data);
                });
            }));
          }
        }

        function bmaGET(uri) {
          return getResource('/bma' + uri);
        }

        function bmaPOST(uri) {
          return postResource('/bma' + uri);
        }

        function bmaWS(server, uri) {
          return ws(wsProtocol() + server + '/bma' + uri);
        }

        let wsMap = {};

        function ws(uri) {
          var sock = wsMap[uri] || new WebSocket(uri);
          wsMap[uri] = sock;
          sock.onclose = function(e) {
            console.log('close');
            console.log(e);
          };
          sock.onerror = function(e) {
            console.log('onerror');
            console.log(e);
          };
          let opened = false, openedCallback;
          sock.onopen = function() {
            opened = true;
            openedCallback && openedCallback();
          };
          let listener, messageType;
          sock.onmessage = function(e) {
            let res = JSON.parse(e.data);
            if (res.type == 'log') {
              for (let i = 0, len = res.value.length; i < len; i++) {
                let log = res.value[i];
                // console[log.level](log.msg);
              }
            }
            if (listener && (messageType === undefined || (res.type === messageType))) {
              listener(res);
            }
          };
          return {
            on: function(type, callback) {
              messageType = type;
              listener = callback;
            },
            whenOpened: () => co(function *() {
              if (opened) return true;
              else {
                yield Q.Promise((resolve) => {
                  openedCallback = resolve;
                });
              }
            }),
            send: (msg) => sock.send(msg)
          };
        }

        return {
          webmin: {
            getExportURL: () => httpProtocol() + server + '/webmin/data/duniter_export',
            getImportURL: () => httpProtocol() + server + '/webmin/data/duniter_import',
            ws: () => ws(wsProtocol() + server + '/webmin/ws'),
            summary: getResource('/webmin/summary'),
            server: {
              http: {
                start: getResource('/webmin/server/http/start'),
                stop: getResource('/webmin/server/http/stop'),
                openUPnP: getResource('/webmin/server/http/upnp/open'),
                regularUPnP: getResource('/webmin/server/http/upnp/regular')
              },
              services: {
                startAll: getResource('/webmin/server/services/start_all'),
                stopAll: getResource('/webmin/server/services/stop_all')
              },
              sendConf: postResource('/webmin/server/send_conf'),
              netConf: postResource('/webmin/server/net_conf'),
              keyConf: postResource('/webmin/server/key_conf'),
              cpuConf: postResource('/webmin/server/cpu_conf'),
              testSync: postResource('/webmin/server/test_sync'),
              startSync: postResource('/webmin/server/start_sync'),
              previewNext: getResource('/webmin/server/preview_next'),
              autoConfNetwork: getResource('/webmin/server/auto_conf_network'),
              resetData: getResource('/webmin/server/reset/data'),
              republishNewSelfPeer: getResource('/webmin/server/republish_selfpeer')
            },
            key: {
              preview: postResource('/webmin/key/preview')
            },
            network: {
              interfaces: getResource('/webmin/network/interfaces')
            }
          },
          node: {
            summary: bmaGET('/node/summary')
          },
          wot: {
            lookup: bmaGET('/wot/lookup/:search'),
            members: bmaGET('/wot/members')
          },
          network: {
            peering: {
              self: bmaGET('/network/peering'),
              peers: bmaGET('/network/peering/peers')
            },
            peers: bmaGET('/network/peers')
          },
          currency: {
            parameters: bmaGET('/blockchain/parameters')
          },
          blockchain: {
            current: bmaGET('/blockchain/current'),
            block: bmaGET('/blockchain/block/:block'),
            blocks: bmaGET('/blockchain/blocks/:count/:from'),
            block_add: bmaPOST('/blockchain/block'),
            stats: {
              ud: bmaGET('/blockchain/with/ud'),
              tx: bmaGET('/blockchain/with/tx')
            }
          },
          websocket: {
            block: function() {
              return bmaWS(server, '/ws/block');
            },
            peer: function() {
              return bmaWS(server, '/ws/peer');
            }
          },
          origin: {
            network: {
              peering: {
                self: getResource('/network/peering', 'http://')
              }
            }
          }
        }
      }
      let server = window.location.hostname;
      let port = window.location.port;
      var service = BMA([server, port].join(':'));
      service.instance = BMA;
      return service;
    });
};
