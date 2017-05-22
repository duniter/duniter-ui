"use strict";

const
  request = require('request'),
  fs = require('fs-extra'),
  rm = require('rimraf'),
  path = require('path'),
  AdmZip = require('adm-zip'),
  tmp = require('tmp');

const CESIUM_VERSION = '0.12.5';
const CESIUM_RELEASE = 'https://github.com/duniter/cesium/releases/download/v' + CESIUM_VERSION + '/cesium-v' + CESIUM_VERSION + '-web.zip';
const OUTPUT_ZIP = tmp.fileSync().name;
const EXTRACT_PATH = path.join(__dirname, './cesium');
const EXTRACT_OVERWRITE = true;

const outputStream = fs.createWriteStream(OUTPUT_ZIP);

outputStream.on('close', () => {
  console.log('Extracting Cesium to path %s...', EXTRACT_PATH);
  const zip = new AdmZip(OUTPUT_ZIP);
  zip.extractAllTo(EXTRACT_PATH, EXTRACT_OVERWRITE);

  const cesiumSourceFolder = EXTRACT_PATH;
  const cesiumPublicFolder = path.join(__dirname, 'public', 'cesium');
  if (fs.existsSync(cesiumPublicFolder)) {
    // Remove existing cesium installation
    rm.sync(cesiumPublicFolder);
  }

  // Move extracted Cesium to destination folder
  fs.renameSync(cesiumSourceFolder, cesiumPublicFolder);

  // Configure Cesium
  const cesiumConfigFile = path.join(__dirname, 'public', 'cesium', 'config.js');
  let config = fs.readFileSync(cesiumConfigFile, 'utf8');
  config = config.replace(/"plugins"(\n|.)*"version"/, '"plugins\": {},\n\t"version"');
  config = config.replace(/"compatProtocol_0_80": true,/, '"compatProtocol_0_80": false,');
  fs.writeFileSync(cesiumConfigFile, config);

  process.exit(0);
});

console.log('Downloading file %s...', CESIUM_RELEASE);

request({
  followAllRedirects: true,
  url: CESIUM_RELEASE
}).pipe(outputStream);

