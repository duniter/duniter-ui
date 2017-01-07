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

    'cliOptions': [

      // Webmin options
      { value: '--webmhost <host>', desc: 'Local network interface to connect to (IP)' },
      { value: '--webmport <port>', desc: 'Local network port to connect', parser: parseInt }
    ],

    'cli': [{
      name: 'webstart',
      desc: 'Do a webstart',
      requires: ['service'],
      promiseCallback: (duniterServer, conf, program) => co(function*(){

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

          const wbmin = webminController(duniterServer);
          const httpServer = http.createServer(app);
          httpServer.listen(PORT, HOTE);
          console.log("Serveur web disponible a l'adresse http://%s:%s", HOTE, PORT);

          require('./server/lib/routes').webmin(wbmin, app);
          require('./server/lib/routes').webminWS(wbmin)(httpServer);

          yield wbmin.startHTTP();
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
