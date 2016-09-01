"use strict";

module.exports = ($scope, ws, UIUtils) => {

  UIUtils.enableTabs();

  let co = require('co');
  let _ = require('underscore');

  // Default values
  if (!localStorage.getItem('log_error')) localStorage.setItem('log_error', true);
  if (!localStorage.getItem('log_warn')) localStorage.setItem('log_warn', true);
  if (!localStorage.getItem('log_info')) localStorage.setItem('log_info', true);

  $scope.logsSize = parseInt(localStorage.getItem('log_size')) || 100;
  $scope.logs = _.range(0, $scope.logsSize).map(() => "");
  $scope.logsString = "";
  $scope.follow = true;
  $scope.levels = {
    error: localStorage.getItem('log_error') == "true",
    warn: localStorage.getItem('log_warn') == "true",
    info: localStorage.getItem('log_info') == "true",
    debug: localStorage.getItem('log_debug') == "true",
    trace: localStorage.getItem('log_trace') == "true"
  };

  _.keys($scope.levels).map((level) => {
    $scope.$watch('levels.' + level, (newValue) => {
      localStorage.setItem('log_' + level, newValue);
      $scope.logs.splice(0, $scope.logs.length);
      ws.send();
    });
  });

  $scope.$watch('logsSize', (newValue) => {
    localStorage.setItem('log_size', newValue);
    addLogs({ value: [] }, true);
  });

  ws.on('log', addLogs);

  function addLogs(res, autoDigest) {

    if (!$scope.pause) {
      let newlogs = _.filter(res.value, (log) => $scope.levels[log.level]);
      // Add at max LOGS_FLOW_SIZE new lines
      newlogs.splice(0, Math.max(0, newlogs.length - $scope.logsSize));
      // Add just enough space for incoming logs
      $scope.logs.splice(0, Math.max(0, $scope.logs.length + newlogs.length - $scope.logsSize));
      for (let i = 0, len = newlogs.length; i < len; i++) {
        let log = newlogs[i];
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

  return co(function *() {
    yield ws.whenOpened();
    ws.send();
  });
};
