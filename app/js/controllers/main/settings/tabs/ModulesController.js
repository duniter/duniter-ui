"use strict";

const co = require('co')
const _ = require('underscore')

module.exports = ($scope, $http, $state, $interval, $timeout, UIUtils, summary, Webmin, allModules, hasAccess) => {

  let interval
  $scope.hasAccess = hasAccess
  $scope.module_to_install = ''
  $scope.installing = false

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
    const pkg = $scope.module_to_install
    if (!(pkg.match(/^file:\/\//) || pkg.match(/^https?:\/\/.+\.(tar\.gz|tgz)$/) || pkg.match(/^git(\+ssh|\+http|\+https)?:\/\/.+\.git$/))) {
      UIUtils.toast('settings.modules.wrong_package_source')
      return
    }
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
        if (res.error === 1) {
          UIUtils.toast('settings.modules.already_install');
        } else if (res.error === 2) {
          UIUtils.toast('settings.modules.path_does_not_exist');
        } else {
          UIUtils.toast('settings.modules.unknown_error');
        }
      }
    })
  }

  $scope.checkModulesInstallation = () => {
    interval = $interval(() => {
      Webmin.plugin.allModules()
        .then(modules => {
          const initialModulesNames = _.pluck(allModules, 'name')
          const newModulesNames = _.pluck(modules, 'name')
          const added = _.difference(newModulesNames, initialModulesNames)
          const removed = _.difference(initialModulesNames, newModulesNames)
          if (added.length || removed.length) {
            for (const addedName of added) {
              UIUtils.toastRaw('Installed module \'' + addedName + '\'');
            }
            for (const removedName of removed) {
              UIUtils.toastRaw('Removed module \'' + removedName + '\'');
            }
            allModules = modules
            $scope.modules = modulesTransform(modules)
            $scope.installing = false
            $interval.cancel(interval)
            $scope.notifications.help.push({
              icon: 'loop',
              message: 'help.restart_required',
              onclick: () => UIUtils.toast('help.restart_required.message')
            });
          }
        })
    }, 1500)
  }

  function modulesTransform(modules) {
    return modules.map((m) => {
      return {
        name: m.name,
        fullName: [m.name, m.version].join('@'),
        locked: m.locked,
        disabled: !$scope.hasAccess || m.locked,
        installing: false,
        installed: true
      }
    })
  }
};
