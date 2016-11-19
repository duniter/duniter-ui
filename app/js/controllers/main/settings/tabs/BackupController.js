"use strict";

module.exports = ($scope, Importer, Webmin) => {

  $scope.export_link = Webmin.getExportURL();

  Importer($scope);
};
