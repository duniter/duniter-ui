(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("js/controllers/AboutController.js", function(exports, require, module) {
"use strict";

var co = require('co');

module.exports = function ($scope, version, UIUtils) {

  $scope.version = version;

  return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return UIUtils.translate('help.about_duniter.title');

          case 2:
            $scope.$parent.title = _context.sent;

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
};

});

require.register("js/controllers/IndexController.js", function(exports, require, module) {
"use strict";

var co = require('co');

module.exports = function ($scope, $http, $state, Webmin, summary, UIUtils) {

  UIUtils.changeTitle(summary.version, summary.parameters.currency, summary.conf.prefix);

  $scope.message = 'index.message.loading';
  co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var connected, _summary;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            connected = false;
            _context.prev = 1;
            _context.next = 4;
            return Webmin.summary();

          case 4:
            _summary = _context.sent;

            if (!_summary.current) {
              _context.next = 7;
              break;
            }

            return _context.abrupt('return', $state.go('main.home.overview'));

          case 7:
            return _context.abrupt('return', $state.go('configure.choose'));

          case 10:
            _context.prev = 10;
            _context.t0 = _context['catch'](1);

            console.error(connected, _context.t0);

            if (connected) {
              _context.next = 15;
              break;
            }

            return _context.abrupt('return', $state.go('error', { err: 'err.connection' }));

          case 15:
            return _context.abrupt('return', $state.go('error', { err: _context.t0 }));

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 10]]);
  }));
};

});

require.register("js/controllers/init/create/IdentityController.js", function(exports, require, module) {
"use strict";

var conf = require('js/lib/conf/conf');

module.exports = function ($scope, $state, PubkeyGenerator) {

  setTimeout(function () {
    $('select').material_select();
  }, 500);

  $scope.accept = function () {
    var modal = $('#modal1');
    if (modal.css('display') == 'none') {
      $('#modal1').openModal();
    }
  };

  PubkeyGenerator($scope);

  if (conf.dev_autoconf) {
    $scope.$parent.conf.idty_uid = 'dev_' + ~~(Math.random() * 2147483647);
    $scope.$parent.conf.idty_entropy = ~~(Math.random() * 2147483647) + "";
    $scope.$parent.conf.idty_password = ~~(Math.random() * 2147483647) + "";
    $state.go('configure.create.network');
  }
};

});

require.register("js/controllers/init/create/ParametersController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, UIUtils) {

  UIUtils.enableInputs();
};

});

require.register("js/controllers/init/create/RootBlockController.js", function(exports, require, module) {
"use strict";

var co = require('co');
var conf = require('js/lib/conf/conf');

module.exports = function ($scope, $http, $state, Webmin) {

  $scope.generated = '';
  $scope.started = false;
  $scope.message = 'configuration.create_root.need_a_try';

  $scope.start = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var hosts;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              hosts = [];

              if ($scope.$parent.conf.remote_ipv4) {
                hosts.push([$scope.$parent.conf.remote_ipv4, $scope.$parent.conf.rport].join(':'));
              }
              if ($scope.$parent.conf.remote_ipv6) {
                hosts.push(["[" + $scope.$parent.conf.remote_ipv6 + "]", $scope.$parent.conf.rport].join(':'));
              }
              $scope.host_listening = hosts.join('\n');
              $scope.started = true;
              _context.next = 8;
              return Webmin.server.sendConf({
                conf: $scope.$parent.conf
              });

            case 8:
              _context.next = 10;
              return $scope.try();

            case 10:
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context['catch'](0);

              $scope.message = _context.t0.message;

            case 15:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 12]]);
    }));
  };

  $scope.stop = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              $scope.started = false;

            case 1:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));
  };

  $scope.try = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return Webmin.server.previewNext();

            case 3:
              $scope.block = _context3.sent;

              $scope.generated = $scope.block.raw;
              $scope.message = '';
              _context3.next = 11;
              break;

            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3['catch'](0);

              $scope.message = _context3.t0.message;

            case 11:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this, [[0, 8]]);
    }));
  };

  $scope.accept = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var res;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return Webmin.blockchain.block_add({
                block: $scope.generated
              });

            case 2:
              res = _context4.sent;

              if (!(res.number == 0)) {
                _context4.next = 6;
                break;
              }

              _context4.next = 6;
              return $scope.startServices();

            case 6:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));
  };

  $scope.startServices = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return Webmin.server.services.startAll();

            case 2:
              $state.go('index');

            case 3:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));
  };

  $scope.cancelAndReset = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return Webmin.server.services.stopAll();

            case 2:
              _context6.next = 4;
              return Webmin.server.resetData();

            case 4:
              $state.go('index');

            case 5:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));
  };

  return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return $scope.start();

          case 3:
            _context7.next = 5;
            return $scope.try();

          case 5:
            $scope.started = true;
            _context7.next = 11;
            break;

          case 8:
            _context7.prev = 8;
            _context7.t0 = _context7['catch'](0);

            $scope.started = false;

          case 11:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this, [[0, 8]]);
  }));
};

});

require.register("js/controllers/init/sync/SyncController.js", function(exports, require, module) {
"use strict";

var co = require('co');

module.exports = function ($scope, $http, $state, $timeout, $stateParams, $translate, UIUtils, Webmin) {

  var syncWS = Webmin.ws();

  UIUtils.enableInputs();
  $scope.sync_mode = 'simplified';
  $scope.simplified_host = '';
  $scope.synchronizing = false;
  $scope.sync_failed = false;
  $scope.host = $stateParams.host || localStorage.getItem('sync_host') || '';
  $scope.port = parseInt($stateParams.port) || parseInt(localStorage.getItem('sync_port')) || 10901;
  $scope.to = parseInt($stateParams.to);
  $scope.wrong_host = false;
  $scope.remote_current = null;

  $scope.checkNode = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var current, targetHost;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              $scope.checked_host = '';
              $scope.sync_error = '';
              $scope.sync_message = '';
              if ($scope.sync_mode == 'simplified') {
                $scope.host = $scope.simplified_host.split(':')[0];
                $scope.port = parseInt($scope.simplified_host.split(':')[1]);
              }
              $scope.checking = true;
              _context.prev = 5;
              _context.next = 8;
              return Webmin.server.testSync({
                host: $scope.host,
                port: $scope.port
              });

            case 8:
              current = _context.sent;
              targetHost = [$scope.host, $scope.port].join(':');

              if (current) {
                $scope.remote_current = current;
                $scope.checked_host = targetHost;
              }
              UIUtils.toast('sync.ready.node.part1');
              $timeout(function () {
                if (!$scope.synchronizing) {
                  UIUtils.toast('sync.ready.node.part2');
                }
              }, 6000);
              _context.next = 18;
              break;

            case 15:
              _context.prev = 15;
              _context.t0 = _context['catch'](5);

              $scope.sync_error = 'sync.error.unreachable.try.another.node';

            case 18:
              $scope.checking = false;
              return _context.abrupt('return', $scope.checked_host ? true : false);

            case 20:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[5, 15]]);
    }));
  };

  $scope.startSync = function () {
    $scope.down_percent = 0;
    $scope.apply_percent = 0;
    $scope.sync_failed = false;
    $scope.synchronizing = true;
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var sp, translatedErr;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return $translate('sync.started.node');

            case 2:
              _context2.t0 = _context2.sent;
              _context2.t1 = _context2.t0 + ' ';
              _context2.t2 = $scope.checked_host;
              $scope.sync_message = _context2.t1 + _context2.t2;
              sp = $scope.checked_host.split(':');
              _context2.next = 9;
              return $translate('err.sync.interrupted');

            case 9:
              translatedErr = _context2.sent;

              syncWS.on(undefined, function (data) {
                if (data.type == 'sync') {
                  $scope.down_percent = 100;
                  $scope.apply_percent = 100;
                  $scope.sync_failed = data.value;
                  var errorMessage = data.msg && (data.msg.message || data.msg);
                  errorMessage = translatedErr + ' « ' + errorMessage + ' »';
                  Webmin.server.republishNewSelfPeer().then(function () {
                    return console.log('Peer republished');
                  });
                  if (data.value === true) {
                    $state.go('index');
                  } else {
                    $state.go('error', { err: errorMessage });
                  }
                } else {
                  var changed = true;
                  if (data.type == 'download' && $scope.down_percent != data.value) {
                    $scope.down_percent = data.value;
                    changed = true;
                  }
                  if (data.type == 'applied' && $scope.apply_percent != data.value) {
                    $scope.apply_percent = data.value;
                    changed = true;
                  }
                  if (changed) {
                    $scope.$apply();
                  }
                }
              });
              _context2.next = 13;
              return Webmin.server.autoConfNetwork();

            case 13:
              localStorage.setItem("sync_host", sp[0]);
              localStorage.setItem("sync_port", sp[1]);
              Webmin.server.startSync({
                host: sp[0],
                port: sp[1],
                to: $scope.to,
                chunkLen: Math.max(500, Math.min(25, $scope.remote_current ? $scope.remote_current.number / 100 : 0))
              });

            case 16:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));
  };

  // Autostart
  if ($scope.host && $scope.port && $stateParams.sync) {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var nodeOK;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return $scope.checkNode();

            case 2:
              nodeOK = _context3.sent;

              if (!nodeOK) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt('return', $scope.startSync());

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));
  }
};

});

require.register("js/controllers/main/MainController.js", function(exports, require, module) {
"use strict";

var co = require('co');

module.exports = function ($scope, $state, $http, $timeout, $interval, Webmin, uiModules, summary, UIUtils) {

  $scope.externalMenus = [];

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var moduleName = _step.value;

      var module = window.uiModules[moduleName];
      if (module) {
        $scope.externalMenus.push({
          menuOpen: function menuOpen() {
            return module.menuOpen(summary);
          },
          menuIconClass: module.menuIconClass,
          menuLabel: module.menuLabel
        });
      }
    };

    for (var _iterator = uiModules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

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

  UIUtils.changeTitle(summary.version, summary.parameters.currency, summary.conf.prefix);

  var aboutWin = void 0;

  $scope.showAbout = function () {
    if (aboutWin) {
      aboutWin.focus();
    } else {
      openWindow(window.location.origin + '/#/about', {
        position: 'center',
        height: 380,
        width: 510
      }, function (subwin) {
        subwin.window.gui = window.gui;
        subwin.on('closed', function () {
          aboutWin = null;
          mainWindow.focus();
        });
        aboutWin = subwin;
      });
    }
  };

  $scope.startServer = function () {
    $scope.server_stopped = false;
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Webmin.server.services.startAll();

            case 2:
              $scope.server_started = true;

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };

  $scope.stopServer = function () {
    $scope.server_started = false;
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return Webmin.server.services.stopAll();

            case 2:
              $scope.server_stopped = true;

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));
  };

  $scope.restartServer = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return $scope.stopServer();

            case 2:
              _context3.next = 4;
              return $scope.startServer();

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));
  };

  function checkUpdates() {
    var LATEST_RELEASE_URL = 'https://api.github.com/repos/duniter/duniter/releases/latest';
    co( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var latest, local_string_version, m, localVersion, localSuffix, isLocalAPreRelease, remoteVersion, localMajor, localMinor, localFix, remoteMajor, remoteMinor, remoteFix, newMajor, newMinor, newFix;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return $http.get(LATEST_RELEASE_URL);

            case 3:
              latest = _context4.sent;
              local_string_version = 'v' + summary.version;
              m = local_string_version.match(/^v([\d.]+)([ab]?\d*)/);
              localVersion = m && m[1] || "";
              localSuffix = m && m[2];
              isLocalAPreRelease = !!localSuffix;
              remoteVersion = latest.data.tag_name.substr(1);
              localMajor = parseInt(localVersion.split('.')[0]);
              localMinor = parseInt(localVersion.split('.')[1]);
              localFix = parseInt(localVersion.split('.')[2]);
              remoteMajor = parseInt(remoteVersion.split('.')[0]);
              remoteMinor = parseInt(remoteVersion.split('.')[1]);
              remoteFix = parseInt(remoteVersion.split('.')[2]);
              newMajor = remoteMajor > localMajor;
              newMinor = !newMajor && remoteMinor > localMinor;
              newFix = !newMinor && remoteFix > localFix;

              if (newMajor || newMinor || newFix || localVersion == remoteVersion && isLocalAPreRelease) {
                if ($scope.notifications.help.filter(function (entry) {
                  return entry.message == 'help.new_version_available';
                }).length == 0) {
                  $scope.notifications.help.push({
                    icon: 'play_for_work',
                    message: 'help.new_version_available',
                    onclick: function onclick() {
                      return openExternal('https://github.com/duniter/duniter/releases/latest');
                    }
                  });
                }
              }
              _context4.next = 25;
              break;

            case 22:
              _context4.prev = 22;
              _context4.t0 = _context4['catch'](0);

              console.error(_context4.t0);

            case 25:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this, [[0, 22]]);
    }));
  }

  $interval(checkUpdates, 1000 * 3600);
  $timeout(checkUpdates, 1000);
};

});

require.register("js/controllers/main/graphs/GraphsBlockchainController.js", function(exports, require, module) {
"use strict";

var BLOCKS_COUNT = 40;

var co = require('co');

module.exports = function ($scope, $state, $timeout, Webmin, UIUtils, Graph) {

  var data = {};

  $scope.loading = true;
  $scope.blocksCount = $scope.blocksCount || BLOCKS_COUNT;

  $scope.$watch('withTime', function (newValue) {
    if (newValue) {
      timeGraph();
    }
  });

  $scope.$watch('withSpeed', function (newValue) {
    if (newValue) {
      speedGraph();
    }
  });

  $scope.$watch('withDifficulty', function (newValue) {
    if (newValue) {
      diffGraph();
    }
  });

  $scope.updateGraphs = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var summary, parameters, blocks, speeds, accelerations, medianTimeIncrements, actualDurations, BY_HOUR, i, len, block, acc, previousPos, j, availPreviousBlocks, localAvgSpeed, realDuration, graphs, _i, _len;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Webmin.summary();

            case 2:
              summary = _context.sent;
              _context.next = 5;
              return Webmin.currency.parameters();

            case 5:
              parameters = _context.sent;
              _context.next = 8;
              return Webmin.blockchain.blocks({
                count: $scope.blocksCount,
                from: Math.max(0, summary.current.number - $scope.blocksCount)
              });

            case 8:
              blocks = _context.sent;
              speeds = [], accelerations = [], medianTimeIncrements = [], actualDurations = [];
              BY_HOUR = 3600;

              for (i = 0, len = blocks.length; i < len; i++) {
                block = blocks[i];
                acc = 0;
                previousPos = Math.max(0, i - parameters.dtDiffEval);

                for (j = previousPos; j < i; j++) {
                  acc += blocks[j + 1].medianTime - blocks[j].medianTime;
                }
                availPreviousBlocks = i - 1 - previousPos;
                localAvgSpeed = acc / (availPreviousBlocks || 1);
                realDuration = !isNaN(localAvgSpeed) && localAvgSpeed != 0 ? localAvgSpeed : parameters.avgGenTime;

                actualDurations.push(parseFloat(realDuration.toFixed(2)));
                speeds.push(parseFloat((BY_HOUR / realDuration).toFixed(2)));
                accelerations.push(block.time - block.medianTime);
                medianTimeIncrements.push(block.medianTime - (i ? blocks[i - 1].medianTime : block.medianTime));
              }
              data.summary = summary;
              data.speeds = speeds;
              data.accelerations = accelerations;
              data.medianTimeIncrements = medianTimeIncrements;
              data.actualDurations = actualDurations;
              data.minSpeeds = speeds.map(function () {
                return parseFloat((BY_HOUR / Math.ceil(parameters.avgGenTime * Math.sqrt(1.066))).toFixed(2));
              });
              data.maxSpeeds = speeds.map(function () {
                return parseFloat((BY_HOUR / Math.floor(parameters.avgGenTime / Math.sqrt(1.066))).toFixed(2));
              });
              data.minDurations = speeds.map(function () {
                return parseFloat((parameters.avgGenTime / 1.066).toFixed(2));
              });
              data.maxDurations = speeds.map(function () {
                return parseFloat((parameters.avgGenTime * 1.066).toFixed(2));
              });
              data.difficulties = blocks.map(function (b) {
                return b.powMin;
              });

              graphs = [];

              if ($scope.withTime) graphs.push(timeGraph);
              if ($scope.withSpeed) graphs.push(speedGraph);
              if ($scope.withDifficulty) graphs.push(diffGraph);
              for (_i = 0, _len = graphs.length; _i < _len; _i++) {
                graphs[_i]();
              }
              $scope.loading = false;

            case 28:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };

  function timeGraph() {
    if ($scope.withTime) {
      Graph.timeGraphs('#timeGraph', Math.max(0, data.summary.current.number - $scope.blocksCount + 1), data.accelerations, data.medianTimeIncrements, data.actualDurations, data.minDurations, data.maxDurations);
    }
  }

  function speedGraph() {
    if ($scope.withSpeed) {
      Graph.speedGraph('#speedGraph', Math.max(0, data.summary.current.number - $scope.blocksCount), data.speeds, data.minSpeeds, data.maxSpeeds, function (series) {
        $scope.series = series;
      });
    }
  }

  function diffGraph() {
    if ($scope.withDifficulty) {
      Graph.difficultyGraph('#difficultyGraph', Math.max(0, data.summary.current.number - $scope.blocksCount), data.difficulties);
    }
  }

  return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return $scope.updateGraphs();

          case 2:
            $scope.withTime = true;
            $scope.withDifficulty = true;
            $scope.$apply();

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
};

});

require.register("js/controllers/main/graphs/GraphsController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, UIUtils) {

  UIUtils.enableTabs();

  $scope.$parent.menu = 'graphs';
};

});

require.register("js/controllers/main/home/HomeController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, UIUtils) {

  UIUtils.enableTabs();

  $scope.$parent.menu = 'home';
};

});

require.register("js/controllers/main/home/tabs/HomeConnectionsController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, Webmin, heads, info, conf, ws) {

  $scope.discriminateNodes = function (info) {
    info.connections.level1.concat(info.connections.level2).forEach(function (c) {
      c.prefered = (conf.preferedNodes || []).indexOf(c.pubkey) !== -1;
      c.privileged = (conf.privilegedNodes || []).indexOf(c.pubkey) !== -1;
    });
    return info;
  };

  $scope.info = $scope.discriminateNodes(info);
  $scope.heads = [];

  var headsMap = {};

  $scope.headsIntoMap = function (heads) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = heads[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var value = _step.value;

        var sp = value.message.split(':');
        var api = sp[0];
        var pubkey = sp[3];
        var blockstamp = sp[4];
        var ws2pId = sp[5];
        var software = sp[6];
        var softVersion = sp[7];
        var prefix = sp[8];
        var uid = value.uid;
        // Gestion de l'ancien format
        console.log(value.message);
        if (!value.message.match(/:1:/)) {
          pubkey = sp[2];
          blockstamp = sp[3];
          uid = value.uid;
        }
        var ws2pFullId = pubkey + "-" + ws2pId;
        headsMap[ws2pFullId] = {
          api: api, blockstamp: blockstamp, uid: uid, ws2pId: ws2pId, software: software, softVersion: softVersion, prefix: prefix
        };
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    $scope.heads = Object.keys(headsMap).map(function (k) {
      return {
        pubkey: k,
        api: headsMap[k].api,
        uid: headsMap[k].uid,
        blockstamp: headsMap[k].blockstamp,
        ws2pId: headsMap[k].ws2pId,
        software: headsMap[k].software,
        softVersion: headsMap[k].softVersion,
        prefix: headsMap[k].prefix
      };
    });
  };

  $scope.headsIntoMap(heads);

  ws.on('ws2p', function (obj) {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (obj.value.ws2p === 'heads') {
                $scope.headsIntoMap(obj.value.added);
              } else if (obj.value.ws2p === 'connected' || obj.value.ws2p === 'disconnected') {
                co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.t0 = $scope;
                          _context.next = 3;
                          return Webmin.network.ws2p.info();

                        case 3:
                          _context.t1 = _context.sent;
                          $scope.info = _context.t0.discriminateNodes.call(_context.t0, _context.t1);

                        case 5:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee, this);
                }));
              }
              $scope.$apply();

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));
  });

  var co = require('co');

  $scope.update = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var delayP;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              $scope.searching = true;
              delayP = Q.delay(500);
              _context3.next = 4;
              return Webmin.network.peers();

            case 4:
              $scope.peers = _context3.sent.peers;
              _context3.next = 7;
              return delayP;

            case 7:
              $scope.searching = false;
              $scope.$apply();

            case 9:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));
  };
};

});

require.register("js/controllers/main/home/tabs/HomeNetworkController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, Webmin, peers) {

  $scope.peers = peers.peers;

  var co = require('co');

  $scope.update = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var delayP;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              $scope.searching = true;
              delayP = Q.delay(500);
              _context.next = 4;
              return Webmin.network.peers();

            case 4:
              $scope.peers = _context.sent.peers;
              _context.next = 7;
              return delayP;

            case 7:
              $scope.searching = false;
              $scope.$apply();

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };
};

});

require.register("js/controllers/main/home/tabs/OverviewController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, $interval, Webmin, UIUtils, summary, ws) {

  UIUtils.enableTabs();
  var co = require('co');
  var moment = require('moment');

  $scope.$parent.isStarted = false;
  $scope.connected_ws2p_peers = 0;

  $scope.updateInfo = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var info, map, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, level1, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, level2;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Webmin.network.ws2p.info();

            case 2:
              info = _context.sent;
              map = {};
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context.prev = 7;

              for (_iterator = info.connections.level1[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                level1 = _step.value;

                map[level1.pubkey] = true;
              }
              _context.next = 15;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context['catch'](7);
              _didIteratorError = true;
              _iteratorError = _context.t0;

            case 15:
              _context.prev = 15;
              _context.prev = 16;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 18:
              _context.prev = 18;

              if (!_didIteratorError) {
                _context.next = 21;
                break;
              }

              throw _iteratorError;

            case 21:
              return _context.finish(18);

            case 22:
              return _context.finish(15);

            case 23:
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context.prev = 26;
              for (_iterator2 = info.connections.level2[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                level2 = _step2.value;

                map[level2.pubkey] = true;
              }
              _context.next = 34;
              break;

            case 30:
              _context.prev = 30;
              _context.t1 = _context['catch'](26);
              _didIteratorError2 = true;
              _iteratorError2 = _context.t1;

            case 34:
              _context.prev = 34;
              _context.prev = 35;

              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }

            case 37:
              _context.prev = 37;

              if (!_didIteratorError2) {
                _context.next = 40;
                break;
              }

              throw _iteratorError2;

            case 40:
              return _context.finish(37);

            case 41:
              return _context.finish(34);

            case 42:
              $scope.connected_ws2p_peers = Object.keys(map).length;

            case 43:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[7, 11, 15, 23], [16,, 18, 22], [26, 30, 34, 42], [35,, 37, 41]]);
    }));
  };

  bindBlockWS(function () {
    $scope.loadPowData();
  });
  var M = summary.current.monetaryMass || 0;
  // const nbUDperYear = Math.ceil(365.25 * 3600 * 24 / summary.parameters.dt);
  // const globalC = Math.round(Math.pow(1 + summary.parameters.c, nbUDperYear) * 100) / 100 - 1;
  var UD = summary.parameters.ud0;
  if (summary.lastUDBlock) {
    var N = summary.current.membersCount;
    UD = parseInt(Math.round(summary.lastUDBlock.dividend * Math.pow(10, summary.lastUDBlock.unitbase)));
  }
  $scope.current = summary.current;
  $scope.current_currency = summary.current.currency;
  $scope.current_number = summary.current.number;
  $scope.current_membersCount = summary.current.membersCount;
  $scope.current_medianTime = summary.current.medianTime;
  $scope.current_powMin = summary.current.powMin;
  $scope.monetaryMass = parseInt(M / UD) || 0;
  $scope.server_started = true;
  $scope.server_stopped = false;
  $scope.phones = [];
  $scope.abc = 'abcdef';
  $scope.newIdentities = 2;

  $(".dropdown-button").dropdown({ constrainwidth: false });

  $scope.lastNearPoW = '';
  $scope.totalPoW = '...';
  $scope.sync_state = 'home.pulling.state.unkown';
  $scope.network_percent = 0;
  $scope.peer_percent = 0;
  $scope.has_pulled = false;
  $scope.is_pulling = false;
  $scope.last_pulling = 0;
  var start_block = 0;

  $interval(function () {
    if ($scope.last_pulling) {
      $scope.sync_state = $scope.is_pulling ? 'home.pulling.state.syncing' : 'home.pulling.state.synced';
      $scope.sync_time = moment($scope.last_pulling).fromNow();
    }
  }, 1000);

  $scope.loadPowData = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var res;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return Webmin.powSummary();

            case 2:
              res = _context2.sent;

              $scope.pow_total = res.total;
              $scope.pow_mirror = res.mirror;
              $scope.pow_waiting = res.waiting;

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));
  };

  ws.on(undefined, function (data) {
    if (data.type === 'started') {
      $scope.server_started = true;
      $scope.server_stopped = false;
      bindBlockWS(function () {
        $scope.loadPowData();
      });
      UIUtils.toast('general.server.started');
      $scope.$apply();
    }
    if (data.type === 'already_started') {
      $scope.server_started = true;
      $scope.server_stopped = false;
      bindBlockWS(function () {
        $scope.loadPowData();
      });
      $scope.$apply();
    }
    if (data.type === 'stopped') {
      $scope.server_stopped = true;
      $scope.server_started = false;
      UIUtils.toast('general.server.stopped');
      $scope.$apply();
    }
    if (data.type === 'pulling') {
      $scope.is_pulling = true;
      $scope.has_pulled = true;
      var event = data.value;
      if ($scope.last_pulling && event.type === 'start' || !$scope.last_pulling && event.type !== 'end') {
        $scope.last_pulling = moment();
      }
      if (event.type === 'peer') {
        $scope.network_percent = parseInt((event.data.number + 1) / event.data.length * 100);
        $scope.peer_percent = 100;
        start_block = 0;
      }
      if (event.type === 'applying') {
        if (!start_block) {
          start_block = event.data.number;
        }
        var total = event.data.last - start_block;
        var doneCount = event.data.number - start_block;
        $scope.peer_percent = parseInt(doneCount / total * 100);
      }
      if (event.type === 'end') {
        $scope.is_pulling = false;
        $scope.network_percent = 0;
        $scope.peer_percent = 0;
        start_block = 0;
      }
    }
    if (data.type === 'pow') {
      var pow = data.value;
      if (pow.found) {
        $scope.pow_waiting = true;
        $scope.lastNearPoW = '#' + pow.hash;
        $scope.$apply();
      } else {
        $scope.pow_waiting = false;
        $scope.lastNearPoW = '#' + pow.hash;
        $scope.$apply();
      }
    }
    if (data.type === 'ws2p') {
      if (data.value.ws2p === 'connected' || data.value.ws2p === 'disconnected') {
        co( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return $scope.updateInfo();

                case 2:
                  $scope.$apply();

                case 3:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));
      }
    }
  });

  function bindBlockWS(cb) {
    Webmin.wsBlock().on(undefined, function (block) {
      $scope.current_currency = block.currency;
      $scope.current_number = block.number;
      $scope.current_membersCount = block.membersCount;
      $scope.current_medianTime = block.medianTime;
      $scope.current_powMin = block.powMin;
      var M = summary.current.monetaryMass || 0;
      var UD = summary.parameters.ud0;
      if (summary.lastUDBlock) {
        var _N = summary.current.membersCount;
        UD = parseInt(Math.round(summary.lastUDBlock.dividend * Math.pow(10, summary.lastUDBlock.unitbase)));
      }
      $scope.monetaryMass = parseInt(M / UD) || 0;
      $scope.$apply();
      cb && cb();
    });
  }

  $scope.reconfigure_network = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var delay, netinferfaces, conf;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              $scope.reconfiguring = true;
              delay = Q.delay(1000);
              _context4.prev = 2;
              _context4.next = 5;
              return Webmin.network.interfaces();

            case 5:
              netinferfaces = _context4.sent;
              conf = {};

              conf.local_ipv4 = netinferfaces.auto.local.ipv4 || '';
              conf.local_ipv6 = netinferfaces.auto.local.ipv6 || '';
              conf.remote_ipv4 = netinferfaces.auto.remote.ipv4 || '';
              conf.remote_ipv6 = netinferfaces.auto.remote.ipv6 || '';
              conf.lport = netinferfaces.auto.local.port || 9330;
              conf.rport = netinferfaces.auto.remote.port || 9330;
              conf.upnp = netinferfaces.auto.remote.upnp || false;
              conf.dns = netinferfaces.auto.remote.dns || '';
              _context4.next = 17;
              return Webmin.server.netConf({
                conf: conf
              });

            case 17:
              _context4.next = 19;
              return delay;

            case 19:
              $scope.should_reconfigure = false;
              UIUtils.toast('general.network.reconf_ok');
              $scope.$apply();
              _context4.next = 30;
              break;

            case 24:
              _context4.prev = 24;
              _context4.t0 = _context4['catch'](2);
              _context4.next = 28;
              return delay;

            case 28:
              $scope.reconfiguring = false;
              $scope.$apply();

            case 30:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this, [[2, 24]]);
    }));
  };

  return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var reachable;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return $scope.startServer();

          case 2:
            _context5.prev = 2;

            $scope.updateInfo();
            _context5.next = 6;
            return $scope.loadPowData();

          case 6:
            _context5.next = 8;
            return Webmin.isNodePubliclyReachable();

          case 8:
            reachable = _context5.sent;

            if (!reachable || !reachable.success) {
              $scope.should_reconfigure = true;
            }
            _context5.next = 15;
            break;

          case 12:
            _context5.prev = 12;
            _context5.t0 = _context5['catch'](2);

            console.log(_context5.t0);

          case 15:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[2, 12]]);
  }));
};

});

require.register("js/controllers/main/settings/SettingsController.js", function(exports, require, module) {
"use strict";

var co = require('co');

module.exports = function ($scope, $http, $state, $location, Webmin, UIUtils) {

  UIUtils.enableTabs();

  $scope.$parent.conf = $scope.$parent.conf || {};
  $scope.$parent.menu = 'settings';

  $(".dropdown-button").dropdown({ constrainwidth: false });

  $scope.fullReset = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Webmin.server.services.stopAll();

            case 2:
              _context.next = 4;
              return Webmin.server.resetData();

            case 4:
              $state.go('index');

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };
};

});

require.register("js/controllers/main/settings/tabs/BackupController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, Importer, Webmin) {

  $scope.export_link = Webmin.getExportURL();

  Importer($scope);
};

});

require.register("js/controllers/main/settings/tabs/CPUController.js", function(exports, require, module) {
"use strict";

var co = require('co');

module.exports = function ($scope, $http, $state, $timeout, UIUtils, summary, Webmin) {

  $scope.cpuPower = parseInt(summary.conf.cpu * 100);

  $scope.updateCPUpower = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              $scope.savingCPU = true;
              _context.next = 3;
              return Webmin.server.cpuConf({
                cpu: parseFloat(($scope.cpuPower / 100).toFixed(2))
              });

            case 3:
              UIUtils.toast('settings.cpu.saved');
              $scope.savingCPU = false;

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };
};

});

require.register("js/controllers/main/settings/tabs/CurrencyController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, conf, UIUtils) {

  $scope.$parent.conf = conf;

  UIUtils.enableInputs();
  $('input').attr('disabled', 'disabled');
};

});

require.register("js/controllers/main/settings/tabs/DataController.js", function(exports, require, module) {
"use strict";

var co = require('co');
var Peer = require('js/lib/entity/peer');

module.exports = function ($scope, $http, $state, Webmin, peers) {

  $scope.peers = peers.map(function (peer) {
    var p = new Peer(peer);
    return {
      name: [p.getURL(), "(" + p.pubkey.slice(0, 6) + ")"].join(' '),
      host_port: [p.getHost(), p.getPort()].join('|')
    };
  });

  $scope.resetNode = function () {
    $('#modalReset').openModal();
  };

  $scope.resetNodeAndSync = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var sp;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Webmin.server.services.stopAll();

            case 2:
              _context.next = 4;
              return Webmin.server.resetData();

            case 4:
              sp = $scope.remote_host.split('|');

              $state.go('sync', {
                host: sp[0],
                port: sp[1],
                sync: true
              });

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };
};

});

require.register("js/controllers/main/settings/tabs/KeyController.js", function(exports, require, module) {
"use strict";

var co = require('co');

module.exports = function ($scope, $state, Webmin, summary, PubkeyGenerator) {

  $scope.pubkey = summary.pubkey;

  setTimeout(function () {
    $('select').material_select();
  }, 500);

  $scope.accept = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Webmin.server.keyConf({
                conf: $scope.$parent.conf
              });

            case 2:
              $scope.$parent.conf.idty_entropy = '';
              $scope.$parent.conf.idty_password = '';
              $state.reload();
              $scope.restartServer();

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };

  PubkeyGenerator($scope);
};

});

require.register("js/controllers/main/settings/tabs/LogsController.js", function(exports, require, module) {
"use strict";

module.exports = function ($scope, ws, UIUtils) {

  UIUtils.enableTabs();

  var co = require('co');
  var _ = require('underscore');

  // Default values
  if (!localStorage.getItem('log_error')) localStorage.setItem('log_error', true);
  if (!localStorage.getItem('log_warn')) localStorage.setItem('log_warn', true);
  if (!localStorage.getItem('log_info')) localStorage.setItem('log_info', true);

  $scope.logsSize = parseInt(localStorage.getItem('log_size')) || 100;
  $scope.logs = _.range(0, $scope.logsSize).map(function () {
    return "";
  });
  $scope.logsString = "";
  $scope.follow = true;
  $scope.levels = {
    error: localStorage.getItem('log_error') == "true",
    warn: localStorage.getItem('log_warn') == "true",
    info: localStorage.getItem('log_info') == "true",
    debug: localStorage.getItem('log_debug') == "true",
    trace: localStorage.getItem('log_trace') == "true"
  };

  _.keys($scope.levels).map(function (level) {
    $scope.$watch('levels.' + level, function (newValue) {
      localStorage.setItem('log_' + level, newValue);
      $scope.logs.splice(0, $scope.logs.length);
      ws.send();
    });
  });

  $scope.$watch('logsSize', function (newValue) {
    localStorage.setItem('log_size', newValue);
    addLogs({ value: [] }, true);
  });

  ws.on('log', addLogs);

  function addLogs(res, autoDigest) {

    if (!$scope.pause) {
      var newlogs = _.filter(res.value, function (log) {
        return $scope.levels[log.level];
      });
      // Add at max LOGS_FLOW_SIZE new lines
      newlogs.splice(0, Math.max(0, newlogs.length - $scope.logsSize));
      // Add just enough space for incoming logs
      $scope.logs.splice(0, Math.max(0, $scope.logs.length + newlogs.length - $scope.logsSize));
      for (var i = 0, len = newlogs.length; i < len; i++) {
        var log = newlogs[i];
        $scope.logs.push(log);
      }
      if (!autoDigest) {
        $scope.$apply();
      }
    }

    if ($scope.follow) {
      var elem = document.getElementById('logs');
      if (elem) {
        elem.scrollTop = elem.scrollHeight;
      }
    }
  }

  return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return ws.whenOpened();

          case 2:
            ws.send();

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
};

});

require.register("js/controllers/main/settings/tabs/LogsSettingsController.js", function(exports, require, module) {
"use strict";

var co = require('co');

module.exports = function ($scope, Webmin) {

  $scope.generating = false;
  $scope.error = '';

  $scope.shareLogs = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if ($scope.generating) {
                _context.next = 14;
                break;
              }

              _context.prev = 1;

              $scope.error = '';
              $scope.generating = true;
              _context.next = 6;
              return Webmin.logsExport(2000);

            case 6:
              res = _context.sent;

              $scope.link = res.link;
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context['catch'](1);

              $scope.error = _context.t0 && _context.t0.message || _context.t0 || 'Unknown error';

            case 13:
              $scope.generating = false;

            case 14:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[1, 10]]);
    }));
  };
};

});

require.register("js/controllers/main/settings/tabs/ModulesController.js", function(exports, require, module) {
"use strict";

var co = require('co');
var _ = require('underscore');

module.exports = function ($scope, $http, $state, $interval, $timeout, UIUtils, summary, Webmin, allModules, hasAccess) {

  var interval = void 0;
  $scope.hasAccess = hasAccess.hasAccess;
  $scope.module_to_install = '';
  $scope.installing = false;

  $scope.showWarning = function () {
    return $scope.warningShown = true;
  };
  $scope.hideWarning = function () {
    return $scope.warningShown = false;
  };

  $scope.modules = modulesTransform(allModules);

  $scope.switchModule = function (mod) {
    $scope.modules.map(function (m) {
      return m.disabled = true;
    });
    mod.installing = !mod.installing;
    Webmin.plugin.removePackage(mod.name);
    $scope.checkModulesInstallation();
  };

  $scope.installModule = function () {
    var pkg = $scope.module_to_install;
    if (!(pkg.match(/^.+@(~||\^)?\d+\.\d+\.\d+$/) || pkg.match(/^file:\/\//) || pkg.match(/^https?:\/\/.+\.(tar\.gz|tgz)$/) || pkg.match(/^git(\+ssh|\+http|\+https)?:\/\/.+\.git$/))) {
      UIUtils.toast('settings.modules.wrong_package_source');
      return;
    }
    $scope.modules.map(function (m) {
      return m.disabled = true;
    });
    co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Webmin.plugin.addPackage($scope.module_to_install);

            case 2:
              res = _context.sent;

              if (res.success) {
                $scope.modules.push({
                  fullName: $scope.module_to_install,
                  disabled: true,
                  installing: true,
                  installed: true
                });
                $scope.installing = true;
                $scope.checkModulesInstallation();
              } else {
                $scope.modules = modulesTransform(allModules);
                if (res.error === 1) {
                  UIUtils.toast('settings.modules.already_install');
                } else if (res.error === 2) {
                  UIUtils.toast('settings.modules.path_does_not_exist');
                } else {
                  UIUtils.toast('settings.modules.unknown_error');
                }
              }

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };

  $scope.checkModulesInstallation = function () {
    interval = $interval(function () {
      Webmin.plugin.allModules().then(function (modules) {
        var initialModulesNames = _.pluck(allModules, 'name');
        var newModulesNames = _.pluck(modules, 'name');
        var added = _.difference(newModulesNames, initialModulesNames);
        var removed = _.difference(initialModulesNames, newModulesNames);
        if (added.length || removed.length) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = added[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var addedName = _step.value;

              UIUtils.toastRaw('Installed module \'' + addedName + '\'');
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = removed[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var removedName = _step2.value;

              UIUtils.toastRaw('Removed module \'' + removedName + '\'');
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          allModules = modules;
          $scope.modules = modulesTransform(modules);
          $scope.installing = false;
          $interval.cancel(interval);
          $scope.notifications.help.push({
            icon: 'loop',
            message: 'help.restart_required',
            onclick: function onclick() {
              return UIUtils.toast('help.restart_required.message');
            }
          });
        }
      });
    }, 1500);
  };

  function modulesTransform(modules) {
    return modules.map(function (m) {
      return {
        name: m.name,
        fullName: [m.name, m.version].join('@'),
        locked: m.locked,
        disabled: !$scope.hasAccess || m.locked,
        installing: false,
        installed: true
      };
    });
  }
};

});

require.register("js/controllers/main/settings/tabs/NetworkController.js", function(exports, require, module) {
"use strict";

var co = require('co');
var conf = require('js/lib/conf/conf');

module.exports = function ($scope, $http, $state, Webmin, UIUtils, netinterfaces, firstConf) {

  var autoconf = netinterfaces.auto;

  $scope.autoconfig = function () {
    $scope.$parent.conf.local_ipv4 = autoconf.local.ipv4 || '';
    $scope.$parent.conf.local_ipv6 = autoconf.local.ipv6 || '';
    $scope.$parent.conf.remote_ipv4 = autoconf.remote.ipv4 || '';
    $scope.$parent.conf.remote_ipv6 = autoconf.remote.ipv6 || '';
    $scope.$parent.conf.lport = autoconf.local.port || $scope.$parent.conf.lport;
    $scope.$parent.conf.rport = autoconf.remote.port || $scope.$parent.conf.rport;
    $scope.$parent.conf.upnp = autoconf.remote.upnp || $scope.$parent.conf.upnp;
    $scope.$parent.conf.dns = autoconf.remote.dns || $scope.$parent.conf.dns;

    if (conf.dev_autoconf && firstConf) {
      $state.go('configure.create.root');
    }
  };

  $scope.local_neti = toArrayOfAddresses(netinterfaces.local);
  $scope.remote_neti = toArrayOfAddresses(netinterfaces.remote);

  $scope.$parent.conf = $scope.$parent.conf || {};
  $scope.$parent.conf.ws2p = netinterfaces.conf.ws2p;
  $scope.$parent.conf.proxiesConf = netinterfaces.conf.proxiesConf;
  $scope.$parent.conf.bma = !netinterfaces.conf.nobma;
  $scope.$parent.conf.local_ipv4 = netinterfaces.conf.local.ipv4;
  $scope.$parent.conf.local_ipv6 = netinterfaces.conf.local.ipv6;
  $scope.$parent.conf.remote_ipv4 = netinterfaces.conf.remote.ipv4;
  $scope.$parent.conf.remote_ipv6 = netinterfaces.conf.remote.ipv6;
  $scope.$parent.conf.lport = netinterfaces.conf.local.port;
  $scope.$parent.conf.rport = netinterfaces.conf.remote.port;
  $scope.$parent.conf.upnp = netinterfaces.conf.remote.upnp;
  $scope.$parent.conf.dns = netinterfaces.conf.remote.dns;

  UIUtils.enableInputs();

  if (firstConf) {
    $scope.$parent.conf.lport = conf.default_port;
    $scope.$parent.conf.rport = conf.default_port;
    // Trigger autoconfig
    $scope.autoconfig();
  }

  $scope.saveConf = function () {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              $scope.$parent.conf.remote_ipv6 = $scope.$parent.conf.local_ipv6;
              _context.next = 3;
              return Webmin.server.netConf({
                conf: $scope.$parent.conf
              });

            case 3:
              UIUtils.toast('settings.network.saved');

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };
};

function toArrayOfAddresses(netiScope) {
  return netiScope.reduce(function (arr, neti) {
    return arr.concat(neti.addresses.map(function (addr) {
      return {
        name: [neti.name, addr.address].join(' '),
        addr: addr.address,
        family: addr.family
      };
    }));
  }, []);
}

});

;require.register("js/app.config.js", function(exports, require, module) {
'use strict';

module.exports = function () {

  window.uiModules = {};

  require('./services/webmin')(angular);

  var duniterApp = angular.module('duniterUIApp', ['ui.router', 'homeControllers', 'pascalprecht.translate']);

  duniterApp.config(['$compileProvider', function ($compileProvider) {
    return $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|data):/);
  }]);

  require('./lib/conf/translate')(duniterApp);
  require('./lib/conf/routes')(duniterApp);
  require('js/services/datetime')(duniterApp);
  require('js/services/ui_utils')(duniterApp);
  require('js/services/graphs')(duniterApp);
  require('js/services/pubkeyGenerator')(duniterApp);
  require('js/services/importer')(duniterApp);
  require('js/services/base58')(duniterApp);

  window.duniterChildCallback = function (gui) {
    window.gui = gui;
  };

  window.onresize = function () {
    window.onResize && window.onResize(window);
  };

  window.openWindow = function openWindow(url, options, callback) {
    if (window.gui) {
      // Duniter Desktop
      window.gui.Window.open(url, options, callback);
    } else {
      // Browser
      var innerHeight = options.height || 375;
      var innerWidth = options.width || 500;
      window.open(url, '_blank ', ['top=' + (window.screenTop + (options.top || 200)), 'left=' + (window.screenLeft + (options.left || 200)), 'height=' + (innerHeight + 8), 'width=' + (innerWidth + 16), 'menubar=no', 'status=no'].join(','));
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

  window.openModule = function openWindow(path, options, callback) {
    var url = window.location.origin + '/modules' + path;
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

  var homeControllers = angular.module('homeControllers', ['duniter.services.webmin', 'ngFileUpload']);

  homeControllers.controller('IndexController', require('./controllers/IndexController'));
  homeControllers.controller('AboutController', require('./controllers/AboutController'));
  homeControllers.controller('IdentityController', require('./controllers/init/create/IdentityController'));
  homeControllers.controller('ParametersController', require('./controllers/init/create/ParametersController'));
  homeControllers.controller('RootBlockController', require('./controllers/init/create/RootBlockController'));
  homeControllers.controller('SyncController', require('./controllers/init/sync/SyncController'));
  homeControllers.controller('MainController', require('./controllers/main/MainController'));
  homeControllers.controller('HomeController', require('./controllers/main/home/HomeController'));
  homeControllers.controller('OverviewController', require('./controllers/main/home/tabs/OverviewController'));
  homeControllers.controller('HomeNetworkController', require('./controllers/main/home/tabs/HomeNetworkController'));
  homeControllers.controller('HomeConnectionsController', require('./controllers/main/home/tabs/HomeConnectionsController'));
  homeControllers.controller('LogsController', require('./controllers/main/settings/tabs/LogsController'));
  homeControllers.controller('LogsSettingsController', require('./controllers/main/settings/tabs/LogsSettingsController'));
  homeControllers.controller('NetworkController', require('./controllers/main/settings/tabs/NetworkController'));
  homeControllers.controller('SettingsController', require('./controllers/main/settings/SettingsController'));
  homeControllers.controller('DataController', require('./controllers/main/settings/tabs/DataController'));
  homeControllers.controller('BackupController', require('./controllers/main/settings/tabs/BackupController'));
  homeControllers.controller('CPUController', require('./controllers/main/settings/tabs/CPUController'));
  homeControllers.controller('CurrencyController', require('./controllers/main/settings/tabs/CurrencyController'));
  homeControllers.controller('KeyController', require('./controllers/main/settings/tabs/KeyController'));
  homeControllers.controller('ModulesController', require('./controllers/main/settings/tabs/ModulesController'));
  homeControllers.controller('GraphsController', require('./controllers/main/graphs/GraphsController'));
  homeControllers.controller('GraphsBlockchainController', require('./controllers/main/graphs/GraphsBlockchainController'));
};

});

require.register("js/application.js", function(exports, require, module) {
"use strict";

module.exports = {

  init: function init() {

    // Hack since Node v5
    try {
      window.jade = require('jade' + '/' + 'runtime');
    } catch (e) {}

    console.log('Configuring Angular app...');

    require('./app.config')();

    console.log('App initialized.');
  }
};

});

require.register("js/lib/conf/conf.js", function(exports, require, module) {
"use strict";

module.exports = {
  server: "", // Empty server will use the browser current host
  port: "", // Empty port will use the browser current port
  default_port: 9220,
  dev_autoconf: false,
  api_timeout: 10000 // 10 sec timeout
};

});

require.register("js/lib/conf/i18n/en.json", function(exports, require, module) {
module.exports = {
  "top.menu.overview": "Home",
  "top.menu.data": "Explore",
  "top.menu.settings": "Settings",
  "top.menu.wallet": "Wallet",
  "general.server.started": "Server started",
  "general.server.stopped": "Server stopped",
  "general.choose_option": "Choose your option",
  "general.network.reconf_ok": "Reconfiguration success",
  "global.button.validate": "Validate",
  "global.button.start": "Start",
  "err.unknown": "Unknown error",
  "err.connection": "Could not connect to node",
  "err.back_index": "Get back to previous screen",
  "err.sync.interrupted": "Sync interrupted because the following error occured:",
  "index.message.loading": "Loading...",
  "crypto.secret_key": "Secret key",
  "index.message.current_block": "Current block {{ number }}",
  "configuration.init.choose.title": "Initialization",
  "configuration.init.choose.message": "Your software has to be initialized. You may either connect to an existing one or restore a backup file.",
  "configuration.init.choose.create": "Create a new currency",
  "configuration.init.choose.connect": "Connect to an existing currency",
  "configuration.init.choose.import": "Import from a backup file",
  "configuration.create_currency.cancel": "Cancel & go home",
  "configuration.create_uid.title": "Your identity",
  "configuration.create_uid.message": "As a first step, you need to define your personal, unique identity.<br/>The following informations will be <strong>definitive</strong> for this currency: please choose them carefully.",
  "configuration.create_uid.uid.tooltip": "The name you will be known as.",
  "configuration.create_uid.entropy.tooltip": "An entropy source to make your key unique: an e-mail, a phone n°, ...",
  "configuration.create_uid.password.tooltip": "A secret password to protect your key.",
  "configuration.create_uid.create_button": "Continue",
  "configuration.create_uid.preview_button": "Preview pubkey",
  "configuration.create_uid.nrp_algo_choose": "NRP algorithm",
  "configuration.create_uid.nrp_algo_choose_1": "N = 4096 ; r = 16 ; p = 1",
  "configuration.create_uid.modal_title": "Identity confirmation",
  "configuration.create_uid.modal_message": "This identity will be definitive for this currency: you will be known by your User ID and will be able to access your account using your Secret Key and Password values.",
  "configuration.create_uid.modal_agree": "Agree",
  "configuration.create_uid.modal_disagree": "Disagree",
  "configuration.create_uid.modal_preview_title": "Preview of pubkey",
  "configuration.create_uid.modal_preview_ok": "OK",
  "configuration.ws2p.private": "Enable WS2P Private access",
  "configuration.ws2p.private.desc": "<b>Strongly recommanded</b>. <i>No configuration required</i>. Private WS2P access allows your node to connect through P2P to other nodes without exposing itself to the Internet. This is the most secure and efficient way to connect your node to the network.",
  "configuration.ws2p.private.connections.title": "Connections",
  "configuration.ws2p.private.connections.message": "You can limit the number of active private connections.",
  "configuration.ws2p.private.max": "Maximum",
  "configuration.proxiesConf.title": "Setting up a Proxy",
  "configuration.proxiesConf.proxySocksAddress": "Classical socks proxy",
  "configuration.proxiesConf.torMessage": "<b>Warning :</b> If you want to use a socks proxy to redirect all outgoing traffic via <b>Tor</b>, you must use the <i>\"Tor socks proxy\"</i> field :",
  "configuration.proxiesConf.proxyTorAddress": "Tor socks proxy",
  "configuration.proxiesConf.clear": "clear",
  "configuration.proxiesConf.tor": "tor",
  "configuration.proxiesConf.none": "none",
  "configuration.proxiesConf.reachingClearEp": "How do you want to reach the classic nodes ? (clear endpoints)",
  "configuration.ws2p.public": "Enable WS2P Public access",
  "configuration.ws2p.public.desc": "<b>Recommanded</b>. Public WS2P access allows your node to be publicly visible to communicate through WS2P. Considering that most of the nodes will communicate through WS2P access, it is important to have a maximum number of nodes with Public WS2P access enabled to have a decentralized network.",
  "configuration.ws2p.public.upnp.title": "UPnP",
  "configuration.ws2p.public.upnp.message": "Automated configuration. You need to have a box (router) for this to work. Typically true if you use Duniter at home.",
  "configuration.ws2p.public.upnp.value": "Enable Public WS2P accss through UPnP",
  "configuration.ws2p.public.manual.title": "Manual configuration",
  "configuration.ws2p.public.manual.message": "You can also manually configure your node for Public WS2P access.",
  "configuration.ws2p.public.manual.local_ipv4": "Private (computer)",
  "configuration.ws2p.public.manual.host": "Public (remote host)",
  "configuration.ws2p.public.manual.lport": "Private port",
  "configuration.ws2p.public.manual.rport": "Public port",
  "configuration.ws2p.public.manual.rpath": "WebSocket web path",
  "configuration.ws2p.public.connections.title": "Connections",
  "configuration.ws2p.public.connections.message": "You can limit the number of active public connections.",
  "configuration.ws2p.public.max": "Maximum",
  "configuration.create_network.desc": "<b>Deprecated</b>. BMA is the legacy communication interface for Duniter nodes. It is being deprecated. Yet, you can activate it if you know what you are doing.",
  "configuration.create_network.title": "Network",
  "configuration.create_network.message": "uCoin is a P2P software and needs bidirectionnal access to the network. Please chose carefully the following parameters.",
  "configuration.create_network.none": "None",
  "configuration.create_network.ipv4.title": "IPv4",
  "configuration.create_network.ipv6.title": "IPv6",
  "configuration.create_network.ipv4.message": "For compatibilty reasons, you may prefer to use classic IPv4 interfaces. The configuration is more complicated.",
  "configuration.create_network.local_ipv4": "Private (computer)",
  "configuration.create_network.remote_ipv4": "Public (box/router)",
  "configuration.create_network.local_ipv6": "IPv6",
  "configuration.create_network.lport": "Local port",
  "configuration.create_network.rport": "Remote port",
  "configuration.create_network.port.title": "Ports",
  "configuration.create_network.ipv6.message": "IPv6 gives your computer a unique, direct address to your node over the Internet. This is the <b>recommended way</b> to connect your node to the network.",
  "configuration.create_network.port.message": "Wether you use IPv6 or IPv4, Duniter node will use this port number for connection to the network. If you use IPv6, local and remote port should equal each other.",
  "configuration.create_network.dns.title": "Domain name",
  "configuration.create_network.dns": "Domain name",
  "configuration.create_network.dns.message": "IPv6 (AAAA) and IPv4 (A) DNS records will be used.",
  "configuration.create_network.upnp": "Use UPnP",
  "configuration.create_network.bma": "Enable BMA access",
  "configuration.create_network.button.validate": "Continue",
  "configuration.create_network.button.autoconf": "Automatic configuration",
  "configuration.create_parameters.title": "Currency",
  "configuration.create_parameters.message": "Initial parameters of the currency. It should be carefully chosen, as these parameters never change once the currency is started.",
  "configuration.create_parameters.currency.title": "Money units",
  "configuration.create_parameters.currency.message": "Give a name to your currency. The 3 following parameters configure the way new money units are created.",
  "configuration.create_parameters.currency": "Currency name",
  "configuration.create_parameters.c": "c",
  "configuration.create_parameters.dt": "UD period",
  "configuration.create_parameters.ud0": "UD(0)",
  "configuration.create_parameters.button.validate": "Continue",
  "configuration.create_parameters.wot.title": "Web of Trust",
  "configuration.create_parameters.wot.message": "The following parameters deal with identities and their links gathered in the Web of Trust concept.",
  "configuration.create_parameters.sigStock": "Max cert stock",
  "configuration.create_parameters.sigPeriod": "Delay between 2 certs",
  "configuration.create_parameters.sigValidity": "Cert expiry delay",
  "configuration.create_parameters.msValidity": "Membership expiry delay",
  "configuration.create_parameters.sigQty": "Min required certs",
  "configuration.create_parameters.sigWindow": "Cert time window",
  "configuration.create_parameters.stepMax": "Max distance",
  "configuration.create_parameters.xpercent": "Percent of distance",
  "configuration.create_parameters.blockchain.title": "Blockchain",
  "configuration.create_parameters.blockchain.message": "The technical support of money and identities is the blockchain. It also has some parameters driving its behavior.",
  "configuration.create_parameters.medianTimeBlocks": "Blocks count",
  "configuration.create_parameters.avgGenTime": "Block gen. duration",
  "configuration.create_parameters.dtDiffEval": "Blocks count for diff.",
  "configuration.create_parameters.blocksRot": "Personal diff. blocks",
  "configuration.create_parameters.percentRot": "Personal diff. rotation",
  "configuration.create_root.title": "Root block creation",
  "configuration.create_root.message": "This is the final step to create the new currency! The root block or <i>genesis</i> will include the first members and define the currency parameters. Once generated and submitted, the blockchain will be started.",
  "configuration.create_root.button.start": "Start HTTP",
  "configuration.create_root.button.stop": "Stop HTTP",
  "configuration.create_root.button.generate": "Give a try",
  "configuration.create_root.need_a_try": "You need to generate a first block with the « Give a try » button. Start HTTP server to do so.",
  "configuration.create_root.button.accept_and_send": "Accept this block and start currency",
  "configuration.create_root.button.cancel": "Cancel creation and go to home screen",
  "configuration.create_root.host_listening": "Host listening at:",
  "configuration.create_uid.pubkey_preview": "Public key preview",
  "home.ws2p_peers": "Connected peers",
  "home.current.number": "Current block #",
  "home.current.membersCount": "Members count",
  "home.current.medianTime": "Median time",
  "home.current.powMin": "Common difficulty level",
  "home.current.mmass": "Monetary mass",
  "home.pulling.network": "Network",
  "home.pulling.peer": "Peer",
  "home.pulling.state.unkown": "Next sync in few minutes",
  "home.pulling.state.synced": "Synced",
  "home.pulling.state.syncing": "Syncing...",
  "home.pow.unit": "blocks made by this key",
  "home.pow.is_mirror": "This node is a mirror",
  "home.pow.is_waiting": "Waiting for better proof conditions",
  "home.tabs.overview": "Overview",
  "home.tabs.overview.should_reconfigure": "Your configuration has changed and your node is no more reachable from the network. You should reconfigure it to have a functional node. If this message appears again, you should manually configure the network settings. Often, selecting only IPv6 interface (disabling IPv4) solves the problem.",
  "home.tabs.network": "Peers",
  "home.tabs.network.button.update": "Check peers again",
  "home.tabs.connections": "Network",
  "home.tabs.connections.title.connections": "WS2P Connections",
  "home.tabs.connections.title.network": "Network view",
  "home.tabs.connections.legend.title": "Legend",
  "home.tabs.connections.legend.prefered": "Prefered: nodes that you prefer for outcoming connections",
  "home.tabs.connections.legend.privileged": "Privileged: nodes that you privilege the incoming connections (= invitation)",
  "home.tabs.logs": "Logs",
  "home.tabs.logs.follow.logs": "Follow logs",
  "home.tabs.logs.pause.logs": "Pause logs",
  "home.tabs.logs.level.error": "Error",
  "home.tabs.logs.level.warn": "Warning",
  "home.tabs.logs.level.info": "Info",
  "home.tabs.logs.level.debug": "Debug",
  "home.tabs.logs.level.trace": "Trace",
  "sync.title": "Synchronize",
  "sync.message": "Your node will be synchronized with an existing currency: just enter technical details about a node to sync with it.",
  "sync.host": "Host",
  "sync.port": "Port",
  "sync.check": "Check node",
  "sync.start": "Synchronize with this node",
  "sync.failed": "Synchronization failed.",
  "sync.mode.simplified": "Simplified mode",
  "sync.mode.manual": "Manual mode",
  "sync.simplified.choose": "Node to connect to",
  "sync.simplified.default_option": "Please select a node to continue",
  "sync.simplified.currency": "Currency",
  "sync.simplified.main_mirror": "(main mirror)",
  "sync.simplified.other mirror": "(other mirror)",
  "sync.ready.node.part1": "This node is available!",
  "sync.ready.node.part2": "Click on the green button to proceed.",
  "sync.started.node": "Synchronization started on node:",
  "sync.error.unreachable.try.another.node": "This node is not available. Please select another one.",
  "home.menu.server.stop": "Stop server",
  "home.menu.server.start": "Start server",
  "home.menu.server.restart": "Restart server",
  "home.state": "Server:",
  "home.state.started": "STARTED",
  "home.state.stopped": "STOPPED",
  "settings.tabs.logs": "Logs",
  "settings.tabs.data": "Data",
  "settings.tabs.backup": "Backup",
  "settings.tabs.identity": "Crypto",
  "settings.tabs.network": "Network",
  "settings.tabs.currency": "Currency",
  "settings.tabs.cpu": "CPU",
  "settings.tabs.modules": "Modules",
  "settings.data.reset.title": "Reset this node",
  "settings.data.reset.message": "If you desire to reset this node's data and sync it again with the network, please select a node to sync against and validate.",
  "settings.data.reset.warning": "This process <strong>will not</strong> reset the node identity and network settings, which will be reused.",
  "settings.data.reset.peer.none_option": "Select a node",
  "settings.data.reset.peer.label": "Synchronization peer",
  "settings.data.reset.button": "Full reset of the node",
  "settings.data.reset_sync.button": "Reset data and start sync",
  "settings.logs.title": "Logs",
  "settings.logs.consult.message": "Your node continually generates information messages in a log file. This information may help you understand what your node <i>is doing</i> or what it <i>has done</i> few times ago.",
  "settings.logs.consult.button": "View real-time logs",
  "settings.logs.share.message": "You may want to <b>share your logs</b> with other people, sometimes to get help or to add informations in a bug tracker. Clicking on below button will extract the last 2000 lines of your logs and push it on the web, returning you a link to be shared with whoever you want.",
  "settings.logs.share.button": "Create a web link to your logs",
  "settings.logs.share.generating": "Generating your link...",
  "settings.logs.share.error": "An error occurred during the generation of your link:",
  "settings.data.backup.title": "Backup",
  "settings.data.backup.message": "You can create backups of your node's data and restore them using the buttons below.",
  "settings.data.backup.warning": "<b>Export</b> will only backup your node's data, which <i>excludes your secret key and configuration details</i>.<br><b>Import</b> will reset your node's data by applying the backup. Your secret keys and configuration remains untouched.",
  "settings.data.backup.button.export": "Create a data backup",
  "settings.data.backup.button.import": "Import a data backup",
  "settings.data.backup.importing": "Importing data...",
  "settings.data.backup.imported": "Import successfull!",
  "settings.network.button.validate": "Save and apply network settings",
  "settings.network.saved": "Configuration saved and applied successfully",
  "settings.key.title": "Public key of this node:",
  "settings.key.button.validate": "Save and use this key",
  "settings.key.button.change": "Change keyring",
  "settings.key.pubkey.description": "This public key is the public part of your keyring, which is composed of a public key and a private key. This public key is shared with all the peers of the network and users of the currency, while your private key is secretely kept and used by this node to process operations on the network.",
  "settings.data.modal_title": "Confirm full reset",
  "settings.data.modal_message": "This action will completely reset the data of your node and redirect you to initial configuration screen. Do you confirm?",
  "settings.data.modal_disagree": "No, cancel this",
  "settings.data.modal_agree": "Yes, process the reset",
  "settings.data.reset.experimental": "This functionality is still considered experimental. If you encounters strange behaviors, please stop the software and reset manually your node by removing all the files BUT conf.json under ~/.config/ucoin/ucoin_default, and restart the software.",
  "settings.cpu.title": "CPU settings",
  "settings.cpu.message": "You can adjust the CPU power dedicated to proof-of-work computation. The higher the value, the faster is your node, the higher the chances you have to compute a block early.",
  "settings.cpu.warning": "<b>Up to 8 cores</b> of your machine are dedicated to proof-of-work computation currently. Also, setting CPU to 100% does not mean Duniter will use 100% of each core, but will use as much as possible each of them, as a core is also shared with other programs.",
  "settings.cpu.range": "% of CPU power core dedicated to proof-of-work :",
  "settings.cpu.power": "Core power:",
  "settings.cpu.saved": "CPU settings saved.",
  "settings.modules.title": "Modules",
  "settings.modules.message": "You can install extensions to your Duniter node to provide new features. These extensions are called <b>Duniter modules</b>.",
  "settings.modules.no_access": "This instance does not have enough system rights to install new modules on disk.",
  "settings.modules.install": "Install this module",
  "settings.modules.already_install": "Module already installed",
  "settings.modules.path_does_not_exist": "Path does not lead to a module",
  "settings.modules.wrong_package_source": "Package URL has wrong format",
  "settings.modules.warning": "Please be <b>VERY CAREFUL</b> when installing a module: you should <b>check that it is not a virus</b>, nor wants to steal your informations. <b>A MODULE HAS A LOT OF POWER</b> and can access/modify any part of your system (including your private key), in the limit of the user's access rights.",
  "settings.modules.warning_light": "WARNING! (click to see more)",
  "settings.modules.warning_close": "Close this message",
  "settings.modules.on": "On",
  "settings.modules.off": "Off",
  "settings.modules.installing": "Installation...",
  "settings.modules.installing_warn": "Please <b>do not close Duniter</b> during this process!",
  "settings.modules.uninstalling": "Removal...",
  "graphs.tabs.blockchain": "Blockchain",
  "graphs.tabs.currency": "Currency",
  "graphs.blockchain.range": "Graphs for the last X blocks: (please choose X value)",
  "graphs.blockchain.with.time": "Time variations graph",
  "graphs.blockchain.with.speed": "Writing speed graph",
  "graphs.blockchain.with.difficulty": "Difficulty graph",
  "help.about_duniter": "About Duniter",
  "help.about_duniter.title": "About",
  "help.about_duniter.subtitle": "Duniter Desktop",
  "help.about_duniter.version": "Version: ",
  "help.about_duniter.forum": "Forum",
  "help.about_duniter.chat": "Chat",
  "help.new_version_available": "New version available",
  "help.restart_required": "Restart to apply changes",
  "help.restart_required.message": "Please close Duniter and restart it."
}
;
});

require.register("js/lib/conf/routes.js", function(exports, require, module) {
'use strict';

var co = require('co');
var _ = require('underscore');

module.exports = function (app) {

  app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    // States
    $stateProvider.state('index', {
      url: '/',
      template: require('views/index'),
      resolve: {
        ws: function ws(Webmin) {
          return Webmin.ws();
        },
        summary: function summary(Webmin) {
          return Webmin.summary();
        }
      },
      controller: 'IndexController'
    }).state('about', {
      url: '/about',
      template: require('views/about'),
      resolve: {
        summary: function summary(Webmin) {
          return Webmin.summary();
        },
        version: function version(summary) {
          return summary && 'v' + summary.version || 'unknown version';
        }
      },
      controller: 'AboutController'
    }).state('configure', {
      abstract: true,
      url: '/configure',
      template: require('views/init/layout'),
      controller: function controller($scope) {
        $scope.conf = {
          currency: 'super_currency',
          c: 0.007376575,
          dt: 30.4375 * 24 * 3600,
          ud0: 100,
          stepMax: 3,
          sigDelay: 3600 * 24 * 365 * 5,
          sigPeriod: 0, // Instant
          sigStock: 40,
          sigWindow: 3600 * 24 * 14, // 2 weeks
          sigValidity: 3600 * 24 * 365,
          msValidity: 3600 * 24 * 365,
          sigQty: 0,
          xpercent: 0.9,
          percentRot: 0.66,
          blocksRot: 20,
          avgGenTime: 16 * 60,
          dtDiffEval: 10,
          medianTimeBlocks: 20
        };
      }
    }).state('configure.choose', {
      url: '/choose',
      template: require('views/init/choose'),
      controller: function controller($scope, Importer) {
        Importer($scope);
      }
    }).state('configure.create', {
      url: '/create',
      template: '<div class="ui-scrollable" ui-view=""></div>'
    }).state('configure.create.uid', {
      url: '/create/uid',
      template: require('views/init/create/create_uid'),
      controller: 'IdentityController'
    }).state('configure.create.network', {
      url: '/create/network',
      template: require('views/init/create/create_network'),
      resolve: {
        netinterfaces: function netinterfaces(Webmin) {
          return resolveNetworkAutoConf(Webmin);
        },
        firstConf: function firstConf() {
          return true;
        }
      },
      controller: 'NetworkController'
    }).state('configure.create.parameters', {
      url: '/create/parameters',
      template: require('views/init/create/create_parameters'),
      controller: 'ParametersController'
    }).state('configure.create.root', {
      url: '/create/root',
      template: require('views/init/create/create_root'),
      controller: 'RootBlockController'
    }).state('sync', {
      url: '/sync?host=&port=&sync=&to=',
      template: require('views/init/sync/sync'),
      controller: 'SyncController'
    }).state('main', {
      abstract: true,
      url: '/main',
      template: require('views/main/main'),
      resolve: {
        ws: function ws(Webmin) {
          return Webmin.ws();
        },
        summary: function summary(Webmin) {
          return Webmin.summary();
        },
        uiModules: function uiModules(Webmin) {
          return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var modules, i, _module, injection, script;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return Webmin.plugin.uiModules();

                  case 2:
                    modules = _context.sent;
                    i = 0;

                  case 4:
                    if (!(i < modules.length)) {
                      _context.next = 16;
                      break;
                    }

                    _module = modules[i];
                    _context.next = 8;
                    return Webmin.plugin.uiGetMenuInjection(_module);

                  case 8:
                    injection = _context.sent;
                    script = document.createElement("script");

                    script.type = "text/javascript";
                    script.text = ";" + injection.menu;
                    document.body.appendChild(script);

                  case 13:
                    i++;
                    _context.next = 4;
                    break;

                  case 16:
                    return _context.abrupt('return', modules);

                  case 17:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));
        }
      },
      controller: 'MainController'
    }).state('main.home', {
      abstract: true,
      url: '/home',
      template: require('views/main/home/home'),
      controller: 'HomeController'
    }).state('main.home.overview', {
      url: '/overview',
      template: require('views/main/home/tabs/overview'),
      resolve: {
        summary: function summary(Webmin) {
          return Webmin.summary();
        }
      },
      controller: 'OverviewController'
    }).state('main.home.network', {
      url: '/network',
      template: require('views/main/home/tabs/network'),
      resolve: {
        peers: function peers(Webmin) {
          return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    return _context2.abrupt('return', Webmin.network.peers());

                  case 1:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          }));
        }
      },
      controller: 'HomeNetworkController'
    }).state('main.home.connections', {
      url: '/connections',
      template: require('views/main/home/tabs/connections'),
      resolve: {
        conf: function conf(Webmin) {
          return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    return _context3.abrupt('return', Webmin.network.ws2p.conf());

                  case 1:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          }));
        },
        info: function info(Webmin, conf) {
          return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    return _context4.abrupt('return', Webmin.network.ws2p.info());

                  case 1:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, _callee4, this);
          }));
        },
        heads: function heads(Webmin) {
          return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    return _context5.abrupt('return', Webmin.network.ws2p.heads());

                  case 1:
                  case 'end':
                    return _context5.stop();
                }
              }
            }, _callee5, this);
          }));
        }
      },
      controller: 'HomeConnectionsController'
    }).state('main.settings', {
      abstract: true,
      url: '/settings',
      template: require('views/main/settings/settings'),
      resolve: {
        summary: function summary(Webmin) {
          return Webmin.summary();
        }
      },
      controller: 'SettingsController'
    }).state('main.settings.data', {
      url: '/data',
      template: require('views/main/settings/tabs/data'),
      resolve: {
        peers: function peers(Webmin) {
          return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
            var self, res;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.prev = 0;
                    _context6.next = 3;
                    return Webmin.network.selfPeer();

                  case 3:
                    self = _context6.sent;
                    _context6.next = 6;
                    return Webmin.network.peers();

                  case 6:
                    res = _context6.sent;
                    return _context6.abrupt('return', _.filter(res.peers, function (p) {
                      return p.pubkey != self.pubkey && p.status == 'UP';
                    }));

                  case 10:
                    _context6.prev = 10;
                    _context6.t0 = _context6['catch'](0);

                    console.error(_context6.t0);
                    return _context6.abrupt('return', []);

                  case 14:
                  case 'end':
                    return _context6.stop();
                }
              }
            }, _callee6, this, [[0, 10]]);
          }));
        }
      },
      controller: 'DataController'
    }).state('main.settings.logs', {
      url: '/logs',
      template: require('views/main/settings/tabs/logs'),
      controller: 'LogsSettingsController'
    }).state('main.settings.backup', {
      url: '/backup',
      template: require('views/main/settings/tabs/backup'),
      controller: 'BackupController'
    }).state('main.settings.cpu', {
      url: '/cpu',
      template: require('views/main/settings/tabs/cpu'),
      resolve: {
        summary: function summary(Webmin) {
          return Webmin.summary();
        }
      },
      controller: 'CPUController'
    }).state('main.settings.modules', {
      url: '/modules',
      template: require('views/main/settings/tabs/modules'),
      resolve: {
        summary: function summary(Webmin) {
          return Webmin.summary();
        },
        hasAccess: function hasAccess(Webmin) {
          return Webmin.plugin.checkAccess();
        },
        allModules: function allModules(Webmin) {
          return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
            var modules;
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    _context7.next = 2;
                    return Webmin.plugin.allModules();

                  case 2:
                    modules = _context7.sent;
                    return _context7.abrupt('return', modules);

                  case 4:
                  case 'end':
                    return _context7.stop();
                }
              }
            }, _callee7, this);
          }));
        }
      },
      controller: 'ModulesController'
    }).state('main.settings.crypto', {
      url: '/crypto',
      template: require('views/main/settings/tabs/crypto'),
      controller: 'KeyController'
    }).state('main.settings.network', {
      url: '/network',
      resolve: {
        netinterfaces: function netinterfaces(Webmin) {
          return resolveNetworkAutoConf(Webmin);
        },
        firstConf: function firstConf() {
          return false;
        }
      },
      template: require('views/main/settings/tabs/network'),
      controller: 'NetworkController'
    }).state('main.settings.currency', {
      url: '/currency',
      resolve: {
        conf: function conf(summary) {
          return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
            return regeneratorRuntime.wrap(function _callee8$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    return _context8.abrupt('return', summary.parameters);

                  case 1:
                  case 'end':
                    return _context8.stop();
                }
              }
            }, _callee8, this);
          }));
        }
      },
      template: require('views/main/settings/tabs/currency'),
      controller: 'CurrencyController'
    }).state('main.graphs', {
      abstract: true,
      url: '/graphs',
      template: require('views/main/graphs/graphs'),
      controller: 'GraphsController'
    }).state('main.graphs.blockchain', {
      url: '/blockchain',
      template: require('views/main/graphs/blockchain'),
      controller: 'GraphsBlockchainController'
    }).

    //state('graphs.crypto', {
    //  url: '/crypto',
    //  template: require('views/graphs/crypto'),
    //  controller: 'KeyController'
    //}).
    //
    //state('graphs.network', {
    //  url: '/network',
    //  resolve: {
    //    netinterfaces: (Webmin) => resolveNetworkAutoConf(Webmin),
    //    firstConf: () => false
    //  },
    //  template: require('views/graphs/network'),
    //  controller: 'NetworkController'
    //}).
    //
    //state('graphs.currency', {
    //  url: '/currency',
    //  resolve: {
    //    conf: (bmapi) => co(function *() {
    //      return bmapi.currency.parameters();
    //    })
    //  },
    //  template: require('views/graphs/currency'),
    //  controller: 'CurrencyController'
    //}).

    state('logs', {
      url: '/logs',
      template: require('views/logs'),
      resolve: {
        ws: function ws(Webmin) {
          return Webmin.ws();
        }
      },
      controller: 'LogsController'
    }).state('error', {
      url: '/error\?err',
      template: require('views/error'),
      controller: function controller($scope, $stateParams) {
        return $scope.errorMsg = $stateParams.err || 'err.unknown';
      }
    });

    // Default route
    $urlRouterProvider.otherwise('/');
  }]);

  app.run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      console.error(error);
      $state.go('error', { err: error.message });
    });
  });

  function resolveNetworkAutoConf(Webmin) {
    return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
      var netinterfaces;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return Webmin.network.interfaces();

            case 2:
              netinterfaces = _context9.sent;
              return _context9.abrupt('return', netinterfaces || { local: {}, remote: {} });

            case 4:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));
  }
};

});

require.register("js/lib/conf/translate.js", function(exports, require, module) {
'use strict';

module.exports = function (app) {

  app.config(['$translateProvider', function ($translateProvider) {

    $translateProvider.translations('en', require('./i18n/en'));

    // Default language
    $translateProvider.preferredLanguage('en');

    // Other parameters
    $translateProvider.useSanitizeValueStrategy('');
  }]);
};

});

require.register("js/lib/entity/peer.js", function(exports, require, module) {
"use strict";

module.exports = function Peer(json) {

  var that = this;

  var BMA_REGEXP = /^BASIC_MERKLED_API( ([a-z_][a-z0-9-_.]*))?( ([0-9.]+))?( ([0-9a-f:]+))?( ([0-9]+))$/;

  Object.keys(json).forEach(function (key) {
    that[key] = json[key];
  });

  that.endpoints = that.endpoints || [];
  that.statusTS = that.statusTS || 0;

  that.keyID = function () {
    return that.pubkey && that.pubkey.length > 10 ? that.pubkey.substring(0, 10) : "Unknown";
  };

  that.copyValues = function (to) {
    var obj = that;
    ["version", "currency", "pub", "endpoints", "hash", "status", "statusTS", "block", "signature"].forEach(function (key) {
      to[key] = obj[key];
    });
  };

  that.copyValuesFrom = function (from) {
    var obj = that;
    ["version", "currency", "pub", "endpoints", "block", "signature"].forEach(function (key) {
      obj[key] = from[key];
    });
  };

  that.json = function () {
    var obj = that;
    var json = {};
    ["version", "currency", "endpoints", "status", "block", "signature"].forEach(function (key) {
      json[key] = obj[key];
    });
    json.raw = that.getRaw();
    json.pubkey = that.pubkey;
    return json;
  };

  that.getBMA = function () {
    var bma = null;
    that.endpoints.forEach(function (ep) {
      var matches = !bma && ep.match(BMA_REGEXP);
      if (matches) {
        bma = {
          "dns": matches[2] || '',
          "ipv4": matches[4] || '',
          "ipv6": matches[6] || '',
          "port": matches[8] || 9101
        };
      }
    });
    return bma || {};
  };

  that.getDns = function () {
    var bma = that.getBMA();
    return bma.dns ? bma.dns : null;
  };

  that.getIPv4 = function () {
    var bma = that.getBMA();
    return bma.ipv4 ? bma.ipv4 : null;
  };

  that.getIPv6 = function () {
    var bma = that.getBMA();
    return bma.ipv6 ? bma.ipv6 : null;
  };

  that.getPort = function () {
    var bma = that.getBMA();
    return bma.port ? bma.port : null;
  };

  that.getHost = function () {
    var bma = that.getBMA();
    var host = that.hasValid4(bma) ? bma.ipv4 : bma.dns ? bma.dns : bma.ipv6 ? '[' + bma.ipv6 + ']' : '';
    return host;
  };

  that.getURL = function () {
    var bma = that.getBMA();
    var base = '';
    if (bma.dns) {
      base = bma.dns;
    } else if (that.hasValid4(bma)) {
      base = bma.ipv4;
    } else if (bma.ipv6) {
      base = '[' + bma.ipv6 + ']';
    }
    if (bma.port) base += ':' + bma.port;
    return base;
  };

  that.hasValid4 = function (bma) {
    return bma.ipv4 && !bma.ipv4.match(/^127.0/) && !bma.ipv4.match(/^192.168/) ? true : false;
  };

  that.getNamedURL = function () {
    var bma = that.getBMA();
    var base = that.hasValid4(bma) ? bma.ipv4 : bma.dns ? bma.dns : bma.ipv6 ? '[' + bma.ipv6 + ']' : '';
    if (bma.port) base += ':' + bma.port;
    return base;
  };

  that.isReachable = function () {
    return that.getURL() ? true : false;
  };
};

});

require.register("js/lib/mobileDetector.js", function(exports, require, module) {
"use strict";

module.exports = function mobilecheck() {
  var check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

});

require.register("js/services/base58.js", function(exports, require, module) {
'use strict';

module.exports = function (app) {

  var Base58 = {};

  Base58.alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  Base58.alphabetMap = {};

  for (var i = 0; i < Base58.alphabet.length; i++) {
    Base58.alphabetMap[Base58.alphabet.charAt(i)] = i;
  }

  Base58.encode = function (buffer) {
    if (buffer.length === 0) return '';

    var i = void 0,
        j = void 0,
        digits = [0];
    for (i = 0; i < buffer.length; i++) {
      for (j = 0; j < digits.length; j++) {
        digits[j] <<= 8;
      }digits[digits.length - 1] += buffer[i];

      var carry = 0;
      for (j = digits.length - 1; j >= 0; j--) {
        digits[j] += carry;
        carry = digits[j] / 58 | 0;
        digits[j] %= 58;
      }

      while (carry) {
        digits.unshift(carry);
        carry = digits[0] / 58 | 0;
        digits[0] %= 58;
      }
    }

    // deal with leading zeros
    for (i = 0; i < buffer.length - 1 && buffer[i] == 0; i++) {
      digits.unshift(0);
    }return digits.map(function (digit) {
      return Base58.alphabet[digit];
    }).join('');
  };

  Base58.decode = function (string) {
    if (string.length === 0) return new Uint8Array();

    var input = string.split('').map(function (c) {
      return Base58.alphabetMap[c];
    });

    var i = void 0,
        j = void 0,
        bytes = [0];
    for (i = 0; i < input.length; i++) {
      for (j = 0; j < bytes.length; j++) {
        bytes[j] *= 58;
      }bytes[bytes.length - 1] += input[i];

      var carry = 0;
      for (j = bytes.length - 1; j >= 0; j--) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 0xff;
      }

      while (carry) {
        bytes.unshift(carry);
        carry = bytes[0] >> 8;
        bytes[0] &= 0xff;
      }
    }

    // deal with leading zeros
    for (i = 0; i < input.length - 1 && input[i] == 0; i++) {
      bytes.unshift(0);
    }return new Uint8Array(bytes);
  };

  app.factory('Base58', function () {
    return {
      encode: Base58.encode,
      decode: Base58.decode
    };
  });
};

});

require.register("js/services/datetime.js", function(exports, require, module) {
'use strict';

var _ = require('underscore');
var conf = require('../lib/conf/conf');
var moment = require('moment');

module.exports = function (app) {

  app.filter('mt_date', function () {
    return function (input) {
      if (input == null) {
        return "";
      }
      return moment(input * 1000).format('YYYY MM DD');
    };
  });

  app.filter('mt_time', function () {
    return function (input) {
      if (input == null) {
        return "";
      }
      return moment(input * 1000).format('HH:mm:ss');
    };
  });
};

});

require.register("js/services/graphs.js", function(exports, require, module) {
'use strict';

module.exports = function (app) {

  app.factory('Graph', function () {
    return {

      speedGraph: function speedGraphs(id, offset, speeds, minSpeeds, maxSpeeds, getSeries) {
        var xValuex = [];
        for (var i = 0, len = speeds.length; i < len; i++) {
          xValuex.push(i + offset);
        }
        $(id).highcharts({
          chart: {
            type: "area",
            zoomType: 'x',
            events: {
              load: function load() {
                getSeries(this.series);
              }
            }
          },
          title: {
            text: 'Blocks writing speed'
          },
          subtitle: {
            text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
          },
          xAxis: {
            //categories: xValuex,
            minRange: 3, // 10 blocks,
            labels: {
              formatter: function formatter() {
                return this.value + offset;
              }
            }
          },
          yAxis: {
            //type: 'logarithmic',
            minorTickInterval: 1,
            title: {
              text: 'Blocks per hour (logarithmic scale)'
            },
            floor: 0,
            min: 0
          },
          colors: ['#ff0000', '#7cb5ec', '#000000'],
          legend: {
            enabled: true
          },
          tooltip: {
            shared: true,
            crosshairs: true,
            formatter: blockFormatter(offset)
          },
          plotOptions: {
            area: {
              fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [[0, Highcharts.getOptions().colors[0]], [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]]
              },
              marker: {
                radius: 2
              },
              lineWidth: 1,
              states: {
                hover: {
                  lineWidth: 1
                }
              },
              threshold: null
            }
          },

          series: [{
            type: 'line',
            name: "Upper limit",
            data: maxSpeeds
          }, {
            type: 'area',
            name: "Actual speed",
            data: speeds
          }, {
            type: 'line',
            name: "Lower limit",
            data: minSpeeds
          }]
        });
      },

      difficultyGraph: function difficultyGraph(id, offset, difficulties) {
        $(id).highcharts({
          chart: {
            type: "area",
            zoomType: 'x'
          },
          title: {
            text: 'Proof-of-Work difficulty by block'
          },
          subtitle: {
            text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
          },
          xAxis: {
            minRange: 10, // 10 blocks,
            labels: {
              formatter: function formatter() {
                return this.value + offset;
              }
            }
          },
          yAxis: {
            title: {
              text: 'Number of zeros'
            },
            floor: 0,
            min: 0
          },
          legend: {
            enabled: true
          },
          tooltip: {
            shared: true,
            crosshairs: true,
            formatter: blockFormatter(offset)
          },
          plotOptions: {
            area: {
              fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [[0, Highcharts.getOptions().colors[0]], [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]]
              },
              marker: {
                radius: 2
              },
              lineWidth: 1,
              states: {
                hover: {
                  lineWidth: 1
                }
              },
              threshold: null
            }
          },

          series: [{
            name: 'PoW difficulty',
            data: difficulties
          }]
        });
      },

      timeGraphs: function timeGraphs(id, offset, timeAccelerations, medianTimeIncrements, speeds, minSpeeds, maxSpeeds) {
        var timesInc = [];
        medianTimeIncrements.forEach(function (inc) {
          timesInc.push(inc == 0 ? 1 : inc);
        });
        $(id).highcharts({
          chart: {
            // type: "area",
            zoomType: 'x'
          },
          title: {
            text: 'Blockchain time variations'
          },
          subtitle: {
            text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
          },
          xAxis: {
            minRange: 10, // 10 blocks,
            labels: {
              formatter: function formatter() {
                return this.value + offset;
              }
            }
          },
          yAxis: {
            //type: 'logarithmic',
            minorTickInterval: 1,
            title: {
              text: 'Number of seconds (logarithmic scale)'
            }
          },
          legend: {
            enabled: true
          },
          tooltip: {
            shared: true,
            crosshairs: true,
            formatter: blockFormatter(offset)
          },
          plotOptions: {
            area: {
              fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [[0, Highcharts.getOptions().colors[0]], [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]]
              },
              marker: {
                radius: 2
              },
              lineWidth: 1,
              states: {
                hover: {
                  lineWidth: 1
                }
              },
              threshold: null
            }
          },

          series: [{
            name: 'Time acceleration',
            data: timeAccelerations
          }, {
            name: "Median Time variation",
            data: timesInc
          }, {
            name: "Too high duration",
            data: maxSpeeds
          }, {
            name: "Actual duration",
            data: speeds
          }, {
            name: "Too low duration",
            data: minSpeeds
          }]
        });
      }
    };
  });
};

function blockFormatter(offset) {
  return function () {
    var html = '<span style="font-size: 10px">' + (this.x + offset) + '</span><br/>';
    for (var i = 0, len = this.points.length; i < len; i++) {
      var point = this.points[i];
      var series = point.series;
      html += '<span style="color:' + series.color + '">\u25CF</span>' + series.name + ': <b>' + point.y + '</b><br/>';
    }
    return html;
  };
}

});

;require.register("js/services/importer.js", function(exports, require, module) {
'use strict';

module.exports = function (app) {

  app.factory('Importer', function ($http, $state, $timeout, UIUtils, Upload, Webmin) {

    return function ($scope) {

      $scope.uploadFiles = function (file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
          UIUtils.toast('settings.data.backup.importing');
          file.upload = Upload.upload({
            url: Webmin.getImportURL(),
            data: { importData: file }
          });

          file.upload.then(function (response) {
            $timeout(function () {
              UIUtils.toast('settings.data.backup.imported');
              $state.go('main.home.overview');
              file.result = response.data;
            });
          }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
          }, function (evt) {
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
          });
        }
      };
    };
  });
};

});

require.register("js/services/pubkeyGenerator.js", function(exports, require, module) {
'use strict';

module.exports = function (app) {

  app.factory('PubkeyGenerator', function ($timeout, Webmin) {

    var co = require('co');

    return function ($scope) {

      var concat = "";
      $scope.pubkey_preview = "";
      var timeout = preview();

      function preview() {
        return $timeout(function () {
          if ($scope.$parent) {
            var salt = $scope.$parent.conf.idty_entropy;
            var pass = $scope.$parent.conf.idty_password;
            var newConcat = [salt, pass].join('');
            if (salt && pass && newConcat != concat) {
              concat = newConcat;
              $scope.previewPubkey(concat);
              timeout = preview();
            } else {
              timeout = preview();
            }
          }
        }, 100);
      }

      $scope.previewPubkey = function () {
        return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          var data;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return Webmin.key.preview({
                    conf: $scope.$parent.conf
                  });

                case 2:
                  data = _context.sent;

                  $scope.pubkey_preview = data.pubkey;

                case 4:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, this);
        })).catch(function () {
          return null;
        });
      };
    };
  });
};

});

require.register("js/services/ui_utils.js", function(exports, require, module) {
'use strict';

module.exports = function (app) {

  app.factory('UIUtils', function ($q, $translate, $state, $location) {
    return {

      translate: function translate(msg) {
        return $q.when($translate(msg));
      },

      toastRaw: function toastRaw(msg) {
        return Materialize.toast(msg, 4000);
      },

      toast: function toast(msg) {
        return $q.when($translate(msg)).then(function (translated) {
          return Materialize.toast(translated, 4000);
        });
      },

      enableInputs: function enableInputs() {
        return $('i.prefix, label[value!=""]').addClass('active');
      },

      enableTabs: function enableTabs() {
        var jTabs = $('ul.tabs');
        jTabs.tabs();
        $('ul.tabs a').click(function (e) {
          var href = $(e.currentTarget).attr('href');
          var state = href.slice(1);
          $state.go(state);
        });

        var currentID = $location.path().replace(/\//g, '.').replace(/\./, '');

        jTabs.tabs('select_tab', currentID);
      },

      changeTitle: function changeTitle(version, currency, prefix) {
        return document.title = prefix != 1 ? 'Duniter ' + version + ' : ğ' + currency.slice(1) + '-' + prefix : 'Duniter ' + version + ' : ğ' + currency.slice(1);
      }
    };
  });
};

});

require.register("js/services/webmin.js", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var co = require('co');
var _ = require('underscore');
var conf = require('../lib/conf/conf');

module.exports = function (angular) {

  angular.module('duniter.services.webmin', ['ngResource']).factory('Webmin', function ($http, $q) {

    function httpProtocol() {
      return window.location.protocol + '//';
    }

    function wsProtocol() {
      return window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    }

    function Webmin(server) {

      function getResource(uri, protocol) {
        return function (params) {
          return $q.when(httpGet(uri, params, protocol));
        };
      }

      function httpGet(uri, params, protocol) {
        return Q.Promise(function (resolve, reject) {
          var config = {
            timeout: conf.api_timeout
          },
              suffix = '',
              pkeys = [],
              queryParams = null;
          if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) == 'object') {
            pkeys = _.keys(params);
            queryParams = {};
          }
          pkeys.forEach(function (pkey) {
            var prevURI = uri;
            uri = uri.replace(new RegExp(':' + pkey), params[pkey]);
            if (prevURI == uri) {
              queryParams[pkey] = params[pkey];
            }
          });
          config.params = queryParams;
          $http.get((protocol || httpProtocol()) + server + uri + suffix, config).success(function (data, status, headers, config) {
            resolve(data);
          }).error(function (data, status, headers, config) {
            console.log(data);
            reject(data);
          });
        });
      }

      function postResource(uri) {
        return function (data, params) {
          return $q.when(Q.Promise(function (resolve, reject) {
            var config = {
              timeout: 4000
            },
                suffix = '',
                pkeys = [],
                queryParams = null;
            if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) == 'object') {
              pkeys = _.keys(params);
              queryParams = {};
            }
            pkeys.forEach(function (pkey) {
              var prevURI = uri;
              uri = uri.replace(new RegExp(':' + pkey), params[pkey]);
              if (prevURI == uri) {
                queryParams[pkey] = params[pkey];
              }
            });
            config.params = queryParams;
            $http.post(httpProtocol() + server + uri + suffix, data, config).success(function (data, status, headers, config) {
              resolve(data);
            }).error(function (data, status, headers, config) {
              reject(data);
            });
          }));
        };
      }

      var wsMap = {};

      function _ws(uri) {
        var sock = wsMap[uri] || new WebSocket(uri);
        wsMap[uri] = sock;
        sock.onclose = function (e) {
          console.log('close');
          console.log(e);
        };
        sock.onerror = function (e) {
          console.log('onerror');
          console.log(e);
        };
        var opened = false,
            openedCallback = void 0;
        sock.onopen = function () {
          opened = true;
          openedCallback && openedCallback();
        };
        var listener = void 0,
            messageType = void 0;
        sock.onmessage = function (e) {
          var res = JSON.parse(e.data);
          if (res.type == 'log') {
            for (var i = 0, len = res.value.length; i < len; i++) {
              var log = res.value[i];
              // console[log.level](log.msg);
            }
          }
          if (listener && (messageType === undefined || res.type === messageType)) {
            listener(res);
          }
        };
        return {
          on: function on(type, callback) {
            messageType = type;
            listener = callback;
          },
          whenOpened: function whenOpened() {
            return co( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      if (!opened) {
                        _context.next = 4;
                        break;
                      }

                      return _context.abrupt('return', true);

                    case 4:
                      _context.next = 6;
                      return Q.Promise(function (resolve) {
                        openedCallback = resolve;
                      });

                    case 6:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, this);
            }));
          },
          send: function send(msg) {
            return sock.send(msg);
          }
        };
      }

      return {
        getExportURL: function getExportURL() {
          return httpProtocol() + server + '/webmin/data/duniter_export';
        },
        getImportURL: function getImportURL() {
          return httpProtocol() + server + '/webmin/data/duniter_import';
        },
        isNodePubliclyReachable: getResource('/webmin/server/reachable'),
        ws: function ws() {
          return _ws(wsProtocol() + server + '/webmin/ws');
        },
        wsBlock: function wsBlock() {
          return _ws(wsProtocol() + server + '/webmin/ws_block');
        },
        wsPeer: function wsPeer() {
          return _ws(wsProtocol() + server + '/webmin/ws_peer');
        },
        summary: getResource('/webmin/summary'),
        powSummary: getResource('/webmin/summary/pow'),
        logsExport: function logsExport(nbLines) {
          return getResource('/webmin/logs/export/' + nbLines)();
        },
        blockchain: {
          blocks: function blocks(opts) {
            return getResource('/webmin/blockchain/blocks/' + opts.count + '/' + opts.from)();
          },
          block_add: postResource('/webmin/blockchain/add')
        },
        server: {
          http: {
            start: getResource('/webmin/server/http/start'),
            stop: getResource('/webmin/server/http/stop'),
            openUPnP: getResource('/webmin/server/http/upnp/open'),
            regularUPnP: getResource('/webmin/server/http/upnp/regular')
          },
          services: {
            startAll: getResource('/webmin/server/services/start_all'),
            stopAll: getResource('/webmin/server/services/stop_all')
          },
          sendConf: postResource('/webmin/server/send_conf'),
          netConf: postResource('/webmin/server/net_conf'),
          keyConf: postResource('/webmin/server/key_conf'),
          cpuConf: postResource('/webmin/server/cpu_conf'),
          testSync: postResource('/webmin/server/test_sync'),
          startSync: postResource('/webmin/server/start_sync'),
          previewNext: getResource('/webmin/server/preview_next'),
          autoConfNetwork: getResource('/webmin/server/auto_conf_network'),
          resetData: getResource('/webmin/server/reset/data'),
          republishNewSelfPeer: getResource('/webmin/server/republish_selfpeer')
        },
        key: {
          preview: postResource('/webmin/key/preview')
        },
        network: {
          interfaces: getResource('/webmin/network/interfaces'),
          selfPeer: getResource('/webmin/network/self'),
          peers: getResource('/webmin/network/peers'),
          ws2p: {
            info: getResource('/webmin/network/ws2p/info'),
            heads: getResource('/webmin/network/ws2p/heads'),
            conf: getResource('/webmin/network/ws2p/conf')
          }
        },
        currency: {
          parameters: getResource('/webmin/currency/parameters')
        },
        plugin: {
          allModules: getResource('/webmin/plug/modules'),
          uiModules: getResource('/webmin/plug/ui_modules'),
          uiGetMenuInjection: function uiGetMenuInjection(moduleName) {
            return getResource('/webmin/plug/ui_modules/inject/' + moduleName)();
          },
          checkAccess: getResource('/webmin/plug/check_access'),
          addPackage: function addPackage(pkg) {
            return postResource('/webmin/plug/add/')({ pkg: pkg });
          },
          removePackage: function removePackage(pkg) {
            return postResource('/webmin/plug/rem/')({ pkg: pkg });
          }
        }
      };
    }
    var server = window.location.hostname;
    var port = window.location.port;
    var service = Webmin([server, port].join(':'));
    service.instance = Webmin;
    return service;
  });
};

});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map