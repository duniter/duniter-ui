"use strict";

const co = require('co');
const es = require('event-stream');
const handleRequest = require('../lib/network').handleRequest;
const handleFileRequest = require('../lib/network').handleFileRequest;
const WEBMIN_LOGS_CACHE = 2000;

const WebSocketServer = require('ws').Server;

module.exports = {
    webmin: function(webminCtrl, app) {
        handleRequest(app.get.bind(app), '/webmin/summary',                   webminCtrl.summary);
        handleRequest(app.get.bind(app), '/webmin/summary/pow',               webminCtrl.powSummary);
        handleRequest(app.get.bind(app), '/webmin/currency/parameters',        webminCtrl.currencyParameters);
        handleRequest(app.get.bind(app),   '/webmin/blockchain/blocks/:count/:from', webminCtrl.blockchainBlocks);
        handleRequest(app.post.bind(app),  '/webmin/blockchain/add',           webminCtrl.blockchainAdd);
        handleRequest(app.get.bind(app),   '/webmin/logs/export/:quantity',    webminCtrl.logsExport);
        handleRequest(app.post.bind(app), '/webmin/key/preview',               webminCtrl.previewPubkey);
        handleRequest(app.get.bind(app),  '/webmin/server/reachable',          webminCtrl.isNodePubliclyReachable);
        handleRequest(app.get.bind(app),  '/webmin/server/http/upnp/open',     webminCtrl.openUPnP);
        handleRequest(app.get.bind(app),  '/webmin/server/http/upnp/regular',  webminCtrl.regularUPnP);
        handleRequest(app.get.bind(app),  '/webmin/server/preview_next',       webminCtrl.previewNext);
        handleRequest(app.post.bind(app), '/webmin/server/send_conf',          webminCtrl.sendConf);
        handleRequest(app.post.bind(app), '/webmin/server/net_conf',           webminCtrl.applyNetworkConf);
        handleRequest(app.post.bind(app), '/webmin/server/key_conf',           webminCtrl.applyNewKeyConf);
        handleRequest(app.post.bind(app), '/webmin/server/cpu_conf',           webminCtrl.applyCPUConf);
        handleRequest(app.get.bind(app),  '/webmin/server/republish_selfpeer', webminCtrl.publishANewSelfPeer);
        handleRequest(app.post.bind(app), '/webmin/server/test_sync',          webminCtrl.testPeer);
        handleRequest(app.post.bind(app), '/webmin/server/start_sync',         webminCtrl.startSync);
        handleRequest(app.get.bind(app),  '/webmin/server/auto_conf_network',  webminCtrl.autoConfNetwork);
        handleRequest(app.get.bind(app),  '/webmin/server/services/start_all', webminCtrl.startAllServices);
        handleRequest(app.get.bind(app),  '/webmin/server/services/stop_all',  webminCtrl.stopAllServices);
        handleRequest(app.get.bind(app),  '/webmin/server/reset/data',         webminCtrl.resetData);
        handleRequest(app.get.bind(app),  '/webmin/network/interfaces',        webminCtrl.listInterfaces);
        handleRequest(app.get.bind(app),  '/webmin/network/self',              webminCtrl.selfPeer);
        handleRequest(app.get.bind(app),  '/webmin/network/peers',             webminCtrl.peers);
        handleRequest(app.get.bind(app),  '/webmin/network/ws2p/info',         webminCtrl.ws2pInfo);
        handleRequest(app.get.bind(app),  '/webmin/network/ws2p/heads',        webminCtrl.ws2pHeads);
        handleRequest(app.get.bind(app),  '/webmin/network/ws2p/conf',         webminCtrl.ws2pConf);
        handleRequest(app.get.bind(app),  '/webmin/plug/modules',              webminCtrl.plugModulesList);
        handleRequest(app.get.bind(app),  '/webmin/plug/ui_modules',           webminCtrl.plugUiModulesList);
        handleRequest(app.get.bind(app),  '/webmin/plug/ui_modules/inject/:package', webminCtrl.plugUiModulesGetInjection);
        handleRequest(app.get.bind(app),  '/webmin/plug/check_access',         webminCtrl.plugCheckAccess);
        handleRequest(app.post.bind(app), '/webmin/plug/add',                  webminCtrl.plugAdd);
        handleRequest(app.post.bind(app), '/webmin/plug/rem',                  webminCtrl.plugRemove);
        handleFileRequest(app.get.bind(app),'/webmin/data/duniter_export',     webminCtrl.exportData);
        handleRequest(app.post.bind(app), '/webmin/data/duniter_import',       webminCtrl.importData);
    },
    webminWS: function(webminCtrl) {
        const logger = webminCtrl.server.logger;
        return (httpServer) => {

            // Socket for synchronization events
            let wssEvents = new WebSocketServer({
                server: httpServer,
                path: '/webmin/ws'
            });

            let lastLogs = [];
            wssEvents.on('connection', function connection(ws) {

                ws.on('message', () => {
                    wssEvents.broadcast(JSON.stringify({
                        type: 'log',
                        value: lastLogs
                    }));
                });

                wssEvents.broadcast(JSON.stringify({
                    type: 'log',
                    value: lastLogs
                }));

                // The callback which write each new log message to websocket
                logger.addCallbackLogs((level, msg, timestamp) => {
                    lastLogs.splice(0, Math.max(0, lastLogs.length - WEBMIN_LOGS_CACHE + 1));
                    lastLogs.push({
                        timestamp: timestamp,
                        level: level,
                        msg: msg
                    });
                    wssEvents.broadcast(JSON.stringify({
                        type: 'log',
                        value: [{
                            timestamp: timestamp,
                            level: level,
                            msg: msg
                        }]
                    }));
                });
            });

            wssEvents.broadcast = (data) => wssEvents.clients.forEach((client) => {
                try {
                    client.send(data);
                } catch (e) {
                    console.log(e);
                }
            });

            // Forward blocks & peers
            webminCtrl
                .pipe(es.mapSync(function(data) {
                    // Broadcast block
                    if (data.download !== undefined) {
                        wssEvents.broadcast(JSON.stringify({
                            type: 'download',
                            value: data.download
                        }));
                    }
                    if (data.applied !== undefined) {
                        wssEvents.broadcast(JSON.stringify({
                            type: 'applied',
                            value: data.applied
                        }));
                    }
                    if (data.sync !== undefined) {
                        wssEvents.broadcast(JSON.stringify({
                            type: 'sync',
                            value: data.sync,
                            msg: (data.msg && (data.msg.message || data.msg))
                        }));
                    }
                    if (data.started !== undefined) {
                        wssEvents.broadcast(JSON.stringify({
                            type: 'started',
                            value: data.started
                        }));
                    }
                    if (data.already_started !== undefined) {
                        wssEvents.broadcast(JSON.stringify({
                            type: 'already_started',
                            value: data.already_started
                        }));
                    }
                    if (data.stopped !== undefined) {
                        wssEvents.broadcast(JSON.stringify({
                            type: 'stopped',
                            value: data.stopped
                        }));
                    }
                    if (data.pulling !== undefined) {
                        wssEvents.broadcast(JSON.stringify({
                            type: 'pulling',
                            value: data.pulling
                        }));
                    }
                    if (data.pow !== undefined) {
                        wssEvents.broadcast(JSON.stringify({
                            type: 'pow',
                            value: data.pow
                        }));
                    }
                    if (data.ws2p !== undefined) {
                      co(function*() {
                        if (data.ws2p === 'heads') {
                          for (let head of data.added) {
                            const headInfos = head.message.split(':')
                            let posPubkey = 3;
                            // Gestion des différents formats
                            if (head.messageV2 && head.messageV2.match(/:2:/)) {
                                const headV2Infos = head.message.split(':')
                                head.freeRooms = headV2Infos[9] + ":" + headV2Infos[10]
                            }
                            if (head.message.match(/:1:/)) {
                                posPubkey = 3;
                            } else {
                                posPubkey = 2;
                            }
                            
                            const member = yield server.dal.getWrittenIdtyByPubkey(headInfos[posPubkey])
                            head.uid = member && member.uid || ''
                          }
                          wssEvents.broadcast(JSON.stringify({
                            type: 'ws2p',
                            value: data
                          }));
                        } else {
                          wssEvents.broadcast(JSON.stringify({
                            type: 'ws2p',
                            value: data
                          }));
                        }
                      })
                    }
                }));

          /******
           * BLOCKS
           */

          // Socket for synchronization events
          const server = webminCtrl.server;
          let currentBlock;
          const wssBlock = new WebSocketServer({
            server: httpServer,
            path: '/webmin/ws_block'
          });

          wssBlock.on('error', function (error) {
            logger.error('Error on WS Server');
            logger.error(error);
          });

          wssBlock.on('connection', function connection(ws) {
            co(function *() {
              currentBlock = yield server.dal.getCurrentBlockOrNull();
              if (currentBlock) {
                ws.send(JSON.stringify(currentBlock));
              }
            });
          });

          wssBlock.broadcast = (data) => wssBlock.clients.forEach((client) => {
            try {
              client.send(data);
            } catch (e) {
              logger.error('error on ws: %s', e);
            }
          });

          // Forward blocks & peers
          server
            .pipe(es.mapSync(function(data) {
              try {
                // Broadcast block
                if (data.joiners) {
                  currentBlock = data;
                  wssBlock.broadcast(JSON.stringify(currentBlock));
                }
              } catch (e) {
                logger.error('error on ws mapSync:', e);
              }
            }));
        };
    }
};
