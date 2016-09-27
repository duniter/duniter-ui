const
  request = require('request'),
  fs = require('fs'),
  unzip = require('unzip2');

const CESIUM_RELEASE = '0.3.5';

return request({
  followAllRedirects: true,
  url: 'https://github.com/duniter/cesium/releases/download/v' + CESIUM_RELEASE + '/cesium-v' + CESIUM_RELEASE + '-web.zip'
}).pipe(unzip.Extract({ path: './cesium' }));
