const
  request = require('request'),
  fs = require('fs'),
  path = require('path'),
  AdmZip = require('adm-zip'),
  tmp = require('tmp');

const CESIUM_VERSION = '0.3.5';
const CESIUM_RELEASE = 'https://github.com/duniter/cesium/releases/download/v' + CESIUM_VERSION + '/cesium-v' + CESIUM_VERSION + '-web.zip';
const OUTPUT_ZIP = tmp.fileSync().name;
const EXTRACT_PATH = path.join(__dirname, './cesium');
const EXTRACT_OVERWRITE = true;

const outputStream = fs.createWriteStream(OUTPUT_ZIP);

outputStream.on('close', () => {
  console.log('Extracting Cesium to path %s...', EXTRACT_PATH);
  const zip = new AdmZip(OUTPUT_ZIP);
  zip.extractAllTo(EXTRACT_PATH, EXTRACT_OVERWRITE);
});

console.log('Downloading file %s...', CESIUM_RELEASE);

request({
  followAllRedirects: true,
  url: CESIUM_RELEASE
}).pipe(outputStream);

