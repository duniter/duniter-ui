"use strict";

var conf = require('js/lib/conf/conf');

module.exports = ($scope, $state, PubkeyGenerator) => {

  setTimeout(() => {
    $('select').material_select();
  }, 500);

  $scope.accept = () => {
    let modal = $('#modal1');
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
