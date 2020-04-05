'use strict';

const _ = require('underscore');
const co = require('co');
const fs = require('fs');
const bodyParser = require('body-parser');
const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const webminController = require('./server/controller/webmin.js');

// Inject 'webstart' command if no argument was given
if (process.argv.length === 2) {
  process.argv.push('direct_webstart');
}

module.exports = {
  duniter: {

    cliOptions: [

      // Webmin options
      { value: '--webmhost <host>', desc: 'Local network interface to connect to (IP)' },
      { value: '--webmport <port>', desc: 'Local network port to connect', parser: parseInt },
    ],

    cli: [{

      name               : 'webstart',
      desc               : 'Starts Duniter as a daemon (background task).',
      logs               : false,
      onConfiguredExecute: (server, conf, program, params) => co(function* () {
        yield server.checkConfig();
        const daemon = server.getDaemon('direct_webstart', 'webstart');
        yield startDaemon(program, daemon);
      }),
    }, {

      name               : 'webrestart',
      desc               : 'Stops Duniter daemon and restart it with its web interface.',
      logs               : false,
      onConfiguredExecute: (server, conf, program, params) => co(function* () {
        yield server.checkConfig();
        const daemon = server.getDaemon('direct_webstart', 'webrestart');
        yield stopDaemon(daemon);
        yield startDaemon(program, daemon);
      }),
    }, {
      name             : 'direct_webstart',
      desc             : 'Do a webstart',
      onDatabaseExecute: (server, conf, program, params, startServices, stopServices, stack) => co(function* () {

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
            extended: true,
          }));
          app.use(bodyParser.json());

          const wbmin = webminController(server, startServices, stopServices, listDuniterPlugins, stack);
          const httpServer = http.createServer(app);
          httpServer.listen(PORT, HOTE);
          server.logger.info('Web administration accessible at following address: http://%s:%s', HOTE, PORT);

          require('./server/lib/routes').webmin(wbmin, app);
          require('./server/lib/routes').webminWS(wbmin)(httpServer);

          const uiDeps = listDuniterUIPlugins();
          for (const dep of uiDeps) {
            // Eventual HTTP routing
            if (dep.required.duniterUI.route) {
              const subApp = express();
              dep.required.duniterUI.route(subApp, server, conf, program, params);
              app.use('/modules/', subApp);
            }
          }

          const currentBlock = yield server.dal.getCurrentBlockOrNull();
          if (currentBlock) {
            yield wbmin.startAllServices();
          }

          // Never ending promise
          return new Promise((resolve) => {
          });

          /****************************************/

        } catch (e) {
          console.error(e);
          process.exit(1);
        }
      }),
    }],
  },
};

function startDaemon(program, daemon) {
  return co(function* () {

    const PORT = program.webmport || 9221;

    const isPortAlreadyTaken = yield new Promise((resolve) => {
      isPortTaken(PORT, (err, taken) => err ? reject(err) : resolve(taken));
    });

    if (isPortAlreadyTaken) {
      console.error('Port ' + PORT + ' already used.');
      process.exit(3);
    }

    return new Promise((resolve, reject) => daemon.start((err) => {
      if (err) return reject(err);
      resolve();
    }));
  });
}

/**
 * Checks if a port is already taken by another app.
 *
 * Source: https://gist.github.com/timoxley/1689041
 * @param port
 * @param fn
 */
function isPortTaken(port, fn) {
  const net = require('net');
  const tester = net.createServer()
    .once('error', function (err) {
      if (err.code != 'EADDRINUSE') return fn(err);
      fn(null, true);
    })
    .once('listening', function () {
      tester.once('close', function () {
        fn(null, false);
      })
        .close();
    })
    .listen(port);
}

function stopDaemon(daemon) {
  return new Promise((resolve, reject) => daemon.stop((err) => {
    err && console.error(err);
    if (err) return reject(err);
    resolve();
  }));
}

function listDuniterPlugins() {
  return listPlugins(r => !!r.duniter || !!r.duniterUI);
}

function listDuniterUIPlugins() {
  return listPlugins(r => !!r.duniterUI);
}

function listPlugins(conditionTest) {
  const uiDependencies = [];
  const pathToPackageJSON = path.resolve('./package.json');
  const pkgJSON = JSON.parse(fs.readFileSync(pathToPackageJSON, 'utf8'));
  const peerDeps = pkgJSON.peerDependencies || {};
  const allDeps = _.extend(pkgJSON.dependencies || {}, pkgJSON.devDependencies || {});
  const deps = Object.keys(allDeps);
  for (const dep of deps) {
    try {
      const required = require(dep);
      if (required && conditionTest(required)) {
        uiDependencies.push({
          name   : dep,
          version: allDeps[dep],
          locked : !!peerDeps[dep],
          required,
        });
      }
    } catch (e) {
    }
  }
  // Special: self dependency (if local package is also a module)
  if (pkgJSON.main && pkgJSON.main.match(/\.js/)) { // With NW.js, the main is an index.html file, which causes a bug
    const dep = pkgJSON.name;
    const required = require(path.resolve('./' + pkgJSON.main));
    if (required && conditionTest(required)) {
      uiDependencies.push({
        name   : dep,
        version: 'local',
        locked : true,
        required,
      });
    }
  }
  return uiDependencies;
}
