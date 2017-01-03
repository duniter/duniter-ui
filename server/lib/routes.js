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
        handleRequest(app.get.bind(app),   '/webmin/logs/export/:quantity',     webminCtrl.logsExport);
        handleRequest(app.post.bind(app), '/webmin/key/preview',               webminCtrl.previewPubkey);
        handleRequest(app.get.bind(app),  '/webmin/server/reachable',          webminCtrl.isNodePubliclyReachable);
        handleRequest(app.get.bind(app),  '/webmin/server/http/start',         webminCtrl.startHTTP);
        handleRequest(app.get.bind(app),  '/webmin/server/http/stop',          webminCtrl.stopHTTP);
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
                }));
        };
    }
};
