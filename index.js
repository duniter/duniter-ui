"use strict";

const co = require('co');
const bodyParser = require('body-parser');
const http    = require('http');
const express = require('express');
const path    = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const webminController = require('./server/controller/webmin.js');

// Inject 'webstart' command if no argument was given
if (process.argv.length === 2) {
  process.argv.push('webstart');
}

module.exports = {
  duniter: {

    cliOptions: [

      // Webmin options
      { value: '--webmhost <host>', desc: 'Local network interface to connect to (IP)' },
      { value: '--webmport <port>', desc: 'Local network port to connect', parser: parseInt }
    ],

    cli: [{

      name: 'webstart',
      desc: 'Starts Duniter as a daemon (background task).',
      logs: false,
      onConfiguredExecute: (server, conf, program, params) => co(function*() {
        yield server.checkConfig()
        const daemon = server.getDaemon('direct_webstart', 'webstart')
        yield startDaemon(program, daemon)
      })
    }, {

      name: 'webrestart',
      desc: 'Stops Duniter daemon and restart it with its web interface.',
      logs: false,
      onConfiguredExecute: (server, conf, program, params) => co(function*() {
        yield server.checkConfig()
        const daemon = server.getDaemon('direct_webstart', 'webrestart')
        yield stopDaemon(daemon)
        yield startDaemon(program, daemon)
      })
    }, {
      name: 'direct_webstart',
      desc: 'Do a webstart',
      onDatabaseExecute: (server, conf, program, params, startServices, stopServices) => co(function*(){

        try {

          /****************************************
           * SPECIALISATION
           ***************************************/

          const app = express();
          const HOTE = program.webmhost || 'localhost';
          const PORT = program.webmport || 9220;

          /**
           * Sur appel de l'URL /abc
           */
          app.use(express.static(path.join(__dirname, '..', 'duniter-ui', 'public')));

          app.use(cors());

          // File upload for backup API
          app.use(fileUpload());

          app.use(bodyParser.urlencoded({
            extended: true
          }));
          app.use(bodyParser.json());

          const wbmin = webminController(server, startServices, stopServices);
          const httpServer = http.createServer(app);
          httpServer.listen(PORT, HOTE);
          server.logger.info("Web administration accessible at following address: http://%s:%s", HOTE, PORT);

          require('./server/lib/routes').webmin(wbmin, app);
          require('./server/lib/routes').webminWS(wbmin)(httpServer);

          yield wbmin.startAllServices();

          // Never ending promise
          return new Promise((resolve) => {});

          /****************************************/

        } catch (e) {
          console.error(e);
          process.exit(1);
        }
      })
    }]
  }
};

function startDaemon(program, daemon) {
  return co(function*() {

    const PORT = program.webmport || 9220

    const isPortAlreadyTaken = yield new Promise((resolve) => {
      isPortTaken(PORT, (err, taken) => err ? reject(err) : resolve(taken))
    })

    if (isPortAlreadyTaken) {
      console.error('Port ' + PORT + ' already used.')
      process.exit(3)
    }

    return new Promise((resolve, reject) => daemon.start((err) => {
      if (err) return reject(err)
      resolve()
    }))
  })
}

/**
 * Checks if a port is already taken by another app.
 *
 * Source: https://gist.github.com/timoxley/1689041
 * @param port
 * @param fn
 */
function isPortTaken(port, fn) {
  const net = require('net')
  const tester = net.createServer()
    .once('error', function (err) {
      if (err.code != 'EADDRINUSE') return fn(err)
      fn(null, true)
    })
    .once('listening', function() {
      tester.once('close', function() { fn(null, false) })
        .close()
    })
    .listen(port)
}

function stopDaemon(daemon) {
  return new Promise((resolve, reject) => daemon.stop((err) => {
    err && console.error(err);
    if (err) return reject(err)
    resolve()
  }))
}
