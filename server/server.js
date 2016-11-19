#!/usr/bin/env node
"use strict";

const co      = require('co');
const duniter = require('duniter');
const bodyParser = require('body-parser');
const http    = require('http');
const express = require('express');
const path    = require('path');
const webminController = require('./controller/webmin.js');

const HOME_DUNITER_DATA_FOLDER = 'rml8';

// Use netobs data folder
if (!process.argv.includes('--mdb')) {
    process.argv.push('--mdb');
    process.argv.push(HOME_DUNITER_DATA_FOLDER);
}

// Default action = start
if (process.argv.length === 4) process.argv.push('start');

// Disable Duniter logs
//duniter.statics.logger.mute();

duniter.statics.cli((duniterServer) => co(function*() {

    try {

        /****************************************
         * SPECIALISATION
         ***************************************/

        const app = express();
        const HOTE = 'localhost';
        const PORT = 10500;

        /**
         * Sur appel de l'URL /abc
         */
        app.use(express.static(path.join('..', 'public')));

        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

        const wbmin = webminController(duniterServer);
        require('./lib/routes').webmin(wbmin, app);
        require('./lib/routes').webminWS(wbmin)(app);


        const httpServer = http.createServer(app);
        httpServer.listen(PORT, HOTE);
        console.log("Serveur web disponible a l'adresse http://%s:%s", HOTE, PORT);

        /****************************************/

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}));
