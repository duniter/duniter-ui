module.exports = (app) => {

  app.factory('PubkeyGenerator', function($timeout, Webmin) {

    var co = require('co');

    return ($scope) => {

      let concat = "";
      $scope.pubkey_preview = "";
      let timeout = preview();

      function preview() {
        return $timeout(() => {
          if ($scope.$parent) {
            let salt = $scope.$parent.conf.idty_entropy;
            let pass = $scope.$parent.conf.idty_password;
            let newConcat = [salt, pass].join('');
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

      $scope.previewPubkey = () => co(function *() {
        let data = yield Webmin.key.preview({
          conf: $scope.$parent.conf
        });
        $scope.pubkey_preview = data.pubkey;
      }).catch(() => null);
    };
  });
};
