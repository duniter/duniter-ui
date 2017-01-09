"use strict";

var co = require('co');

module.exports = ($scope, $http, $state, Webmin, summary, UIUtils) => {

  UIUtils.changeTitle(summary.version);

  $scope.message = 'index.message.loading';
  co(function *() {
    let connected = false;
    try {
      let summary = yield Webmin.summary();
      if (summary.current) {
        return $state.go('main.home.overview');
      }
      return $state.go('configure.choose');
    }
    catch (e) {
      console.error(connected, e);
      if (!connected) {
        return $state.go('error', { err: 'err.connection'});
      }
      return $state.go('error', { err: e });
    }
  });
};
