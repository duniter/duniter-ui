"use strict";

var co = require('co');

module.exports = ($scope, $state, $http, $timeout, $interval, BMA, summary, UIUtils, Base58) => {

  const local_host = summary.host.split(':')[0]; // We suppose IPv4 configuration
  const local_port = summary.host.split(':')[1];
  const local_sign_pk = Base58.decode(summary.pubkey);
  const local_sign_sk = Base58.decode(summary.seckey);

  const DEFAULT_CESIUM_SETTINGS = {
    "useRelative": true,
    "timeWarningExpire": 2592000,
    "useLocalStorage": true,
    "rememberMe": true,
    "plugins": {},
    "node": {
      "host": local_host,
      "port": local_port
    },
    "showUDHistory": true
  };

  $scope.notifications = {
    help: []
  };

  Waves.displayEffect();

  var isMobile = require('js/lib/mobileDetector');
  if (isMobile()) {
    $(".button-collapse").sideNav({
      menuWidth: 280
    });
  }

  UIUtils.changeTitle(summary.version);

  $scope.openWallet = () => {

    let walletHeight = parseInt(localStorage.getItem('wallet_height')) || 1000;
    let walletWidth = parseInt(localStorage.getItem('wallet_width')) || 1400;

    openNewTab (window.location.origin + '/cesium/index.html', {
      position: 'center',
      height: walletHeight,
      width: walletWidth,
      show: false
    }, function(win) {
      let settingsStr = win.window.localStorage.getItem('CESIUM_SETTINGS');
      let dataStr = win.window.localStorage.getItem('CESIUM_DATA');
      let settings = (settingsStr && JSON.parse(settingsStr));
      let data = (dataStr && JSON.parse(dataStr));
      let keyPairOK = data && data.keypair && data.keypair.signPk && data.keypair.signSk && true;
      if (keyPairOK) {
        data.keypair.signPk.length = local_sign_pk.length;
        data.keypair.signSk.length = local_sign_sk.length;
        keyPairOK = Base58.encode(Array.from(data.keypair.signPk)) == summary.pubkey
          && Base58.encode(Array.from(data.keypair.signSk)) == summary.seckey
          && data.pubkey == summary.pubkey;
      }
      if (!data
        || !keyPairOK
        || settings.node.host != local_host
        || settings.node.port != local_port) {
        settings = settings || DEFAULT_CESIUM_SETTINGS;
        data = data || {};
        console.debug('Configuring Cesium...');
        settings.node = {
          "host": local_host,
          "port": local_port
        };
        settings.plugins = {};
        settings.rememberMe = true;
        data.pubkey = summary.pubkey;
        data.keypair = {
          signPk: local_sign_pk,
          signSk: local_sign_sk
        };
        win.window.localStorage.setItem('CESIUM_SETTINGS', JSON.stringify(settings));
        win.window.localStorage.setItem('CESIUM_DATA', JSON.stringify(data));
        win.on('closed', () => {
          // Reopen the wallet
          $timeout(() => $scope.openWallet(), 1);
        });
        win.close();
      } else {
        // Cesium is correctly configured for the network part
        win.show();
        win.on('closed', function() {
          localStorage.setItem('wallet_height', win.window.innerHeight - 8); // Seems to always have 8 pixels more
          localStorage.setItem('wallet_width', win.window.innerWidth - 16); // Seems to always have 16 pixels more
          mainWindow.focus();
        });
      }
    });
  };

  let aboutWin;

  $scope.showAbout = () => {
    if (aboutWin) {
      aboutWin.focus();
    } else {
      openWindow(window.location.origin + '/#/about', {
        position: 'center',
        height: 380,
        width: 510
      }, function(subwin) {
        subwin.window.gui = window.gui;
        subwin.on('closed', () => {
          aboutWin = null;
          mainWindow.focus();
        });
        aboutWin = subwin;
      });
    }
  };

  $scope.startServer = () => {
    $scope.server_stopped = false;
    return co(function *() {
      yield BMA.webmin.server.http.start();
      yield BMA.webmin.server.services.startAll();
      yield BMA.webmin.server.http.regularUPnP();
      $scope.server_started = true;
    });
  };

  $scope.stopServer = () => {
    $scope.server_started = false;
    return co(function *() {
      yield BMA.webmin.server.http.stop();
      yield BMA.webmin.server.services.stopAll();
      $scope.server_stopped = true;
    });
  };

  $scope.restartServer = () => {
    return co(function *() {
      yield $scope.stopServer();
      yield $scope.startServer();
    });
  };

  function checkUpdates() {
    const LATEST_RELEASE_URL = 'https://api.github.com/repos/duniter/duniter/releases/latest';
    co(function*() {
      try {
        const latest = yield $http.get(LATEST_RELEASE_URL);
        const local_string_version = 'v' + summary.version;
        const m = local_string_version.match(/^v([\d.]+)([ab]?\d*)/);
        const localVersion = (m && m[1]) || "";
        const localSuffix = m && m[2];
        const isLocalAPreRelease = !!(localSuffix);
        const remoteVersion = latest.data.tag_name.substr(1);
        if (localVersion < remoteVersion || (localVersion == remoteVersion && isLocalAPreRelease)) {
          if ($scope.notifications.help.filter((entry) => entry.message == 'help.new_version_available').length == 0) {
            $scope.notifications.help.push({
              icon: 'play_for_work',
              message: 'help.new_version_available',
              onclick: () => openExternal('https://github.com/duniter/duniter/releases/latest')
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  $interval(checkUpdates, 1000 * 3600);
  $timeout(checkUpdates, 1000);
};
