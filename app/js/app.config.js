module.exports = () => {

  require('./services/bma')(angular);

  var duniterApp = angular.module('duniterUIApp', [
    'ui.router',
    'homeControllers',
    'pascalprecht.translate'
  ]);

  duniterApp.config( [
    '$compileProvider', ($compileProvider) => $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|data):/)
  ]);

  require('./lib/conf/translate')(duniterApp);
  require('./lib/conf/routes')(duniterApp);
  require('js/services/datetime')(duniterApp);
  require('js/services/ui_utils')(duniterApp);
  require('js/services/graphs')(duniterApp);
  require('js/services/pubkeyGenerator')(duniterApp);
  require('js/services/importer')(duniterApp);
  require('js/services/base58')(duniterApp);

  window.onresize = () => {
    window.onResize && window.onResize(window);
  };

  window.openWindow = function openWindow(url, options, callback) {
    if (window.gui) {
      // Duniter Desktop
      window.gui.Window.open(url, options, callback);
    } else {
      // Browser
      let innerHeight = options.height || 375;
      let innerWidth = options.width || 500;
      window.open(url, '_blank ', [
        'top=' + (window.screenTop + (options.top || 200)),
        'left=' + (window.screenLeft + (options.left || 200)),
        'height=' + (innerHeight + 8),
        'width=' + (innerWidth + 16),
        'menubar=no',
        'status=no'
      ].join(','));
    }
  };

  window.openNewTab = function openWindow(url, options, callback) {
    if (window.gui) {
      // Duniter Desktop
      window.gui.Window.open(url, options, callback);
    } else {
      // Browser
      window.open(url, '_blank ');
    }
  };

  window.openExternal = function openExternal(url) {
    if (window.gui) {
      window.gui.Shell.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  let homeControllers = angular.module('homeControllers', ['duniter.services', 'ngFileUpload']);

  homeControllers.controller('IndexController',            require('./controllers/IndexController'));
  homeControllers.controller('AboutController',            require('./controllers/AboutController'));
  homeControllers.controller('IdentityController',         require('./controllers/init/create/IdentityController'));
  homeControllers.controller('ParametersController',       require('./controllers/init/create/ParametersController'));
  homeControllers.controller('RootBlockController',        require('./controllers/init/create/RootBlockController'));
  homeControllers.controller('SyncController',             require('./controllers/init/sync/SyncController'));
  homeControllers.controller('MainController',             require('./controllers/main/MainController'));
  homeControllers.controller('HomeController',             require('./controllers/main/home/HomeController'));
  homeControllers.controller('OverviewController',         require('./controllers/main/home/tabs/OverviewController'));
  homeControllers.controller('HomeNetworkController',      require('./controllers/main/home/tabs/HomeNetworkController'));
  homeControllers.controller('LogsController',             require('./controllers/main/settings/tabs/LogsController'));
  homeControllers.controller('LogsSettingsController',     require('./controllers/main/settings/tabs/LogsSettingsController'));
  homeControllers.controller('NetworkController',          require('./controllers/main/settings/tabs/NetworkController'));
  homeControllers.controller('SettingsController',         require('./controllers/main/settings/SettingsController'));
  homeControllers.controller('DataController',             require('./controllers/main/settings/tabs/DataController'));
  homeControllers.controller('BackupController',           require('./controllers/main/settings/tabs/BackupController'));
  homeControllers.controller('CPUController',              require('./controllers/main/settings/tabs/CPUController'));
  homeControllers.controller('CurrencyController',         require('./controllers/main/settings/tabs/CurrencyController'));
  homeControllers.controller('KeyController',              require('./controllers/main/settings/tabs/KeyController'));
  homeControllers.controller('GraphsController',           require('./controllers/main/graphs/GraphsController'));
  homeControllers.controller('GraphsBlockchainController', require('./controllers/main/graphs/GraphsBlockchainController'));
};
