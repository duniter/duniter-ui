"use strict";

var co = require('co');
var conf = require('js/lib/conf/conf');

module.exports = ($scope, $http, $state, Webmin, UIUtils, netinterfaces, firstConf) => {

  let autoconf = netinterfaces.auto;

  $scope.autoconfig = () => {
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

  $scope.$parent.conf = $scope.$parent.conf || {};
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

  $scope.saveConf = () => co(function *() {
    $scope.$parent.conf.lport = $scope.$parent.conf.rport;
    $scope.$parent.conf.remote_ipv6 = $scope.$parent.conf.local_ipv6;
    yield Webmin.server.netConf({
      conf: $scope.$parent.conf
    });
    UIUtils.toast('settings.network.saved');
  });
};

function toArrayOfAddresses(netiScope) {
  return netiScope.reduce(function(arr, neti) {
    return arr.concat(neti.addresses.map((addr) => {
      return {
        name: [neti.name, addr.address].join(' '),
        addr: addr.address,
        family: addr.family
      };
    }))
  }, []);
}
