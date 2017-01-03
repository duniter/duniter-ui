"use strict";

const co = require('co');
const bodyParser = require('body-parser');
const http    = require('http');
const express = require('express');
const path    = require('path');
const webminController = require('./server/controller/webmin.js');

module.exports = {
  duniter: {

    'cli': [{
      name: 'webstart',
      desc: 'Do a webstart',
      requires: ['service'],
      promiseCallback: (duniterServer) => co(function*(){

        try {

          /****************************************
           * SPECIALISATION
           ***************************************/

          // Inject 'webstart' command if no argument was given
          if (process.argv.length === 2) {
            process.argv.push('webstart');
          }

          const app = express();
          const HOTE = 'localhost';
          const PORT = 9220;

          /**
           * Sur appel de l'URL /abc
           */
          app.use(express.static(path.join(__dirname, '..', 'duniter-ui', 'public')));

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
