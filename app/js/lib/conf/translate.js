module.exports = (app) => {

  app.config(['$translateProvider', ($translateProvider) => {

    $translateProvider.translations('en', require('./i18n/en'));
    $translateProvider.translations('fr', require('./i18n/fr'));

    // Default language
    $translateProvider.preferredLanguage('en');

    // Other parameters
    $translateProvider.useSanitizeValueStrategy('');
  }]);
};
