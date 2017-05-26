"use strict";

const co = require('co')

module.exports = ($scope, $http, $state, $interval, $timeout, UIUtils, summary, Webmin, allModules, hasAccess) => {

  let interval
  $scope.hasAccess = hasAccess
  $scope.module_to_install = ''
  $scope.installing = false
  $scope.initialLength = allModules.length

  $scope.showWarning = () => $scope.warningShown = true
  $scope.hideWarning = () => $scope.warningShown = false

  $scope.modules = modulesTransform(allModules)

  $scope.switchModule = (mod) => {
    $scope.modules.map(m => m.disabled = true)
    mod.installing = !mod.installing
    Webmin.plugin.removePackage(mod.name)
    $scope.checkModulesInstallation()
  }

  $scope.installModule = () => {
    $scope.modules.map(m => m.disabled = true)
    co(function*() {
      const res = yield Webmin.plugin.addPackage($scope.module_to_install)
      if (res.success) {
        $scope.modules.push({
          fullName: $scope.module_to_install,
          disabled: true,
          installing: true,
          installed: true
        })
        $scope.installing = true
        $scope.checkModulesInstallation()
      } else {
        $scope.modules = modulesTransform(allModules)
        UIUtils.toast('settings.modules.already_install');
      }
    })
  }

  $scope.checkModulesInstallation = () => {
    interval = $interval(() => {
      Webmin.plugin.allModules()
        .then(modules => {
          if (modules.length !== $scope.initialLength) {
            $scope.initialLength = modules.length
            $scope.modules = modulesTransform(modules)
            $scope.installing = false
            $interval.cancel(interval)
          }
        })
    }, 1500)
  }

  function modulesTransform(modules) {
    return modules.map((m) => {
      return {
        name: m.name,
        fullName: [m.name, m.version].join('@'),
        disabled: !$scope.hasAccess,
        installing: false,
        installed: true
      }
    })
  }
};
