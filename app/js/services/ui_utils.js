module.exports = (app) => {

  app.factory('UIUtils', function($q, $translate, $state, $location) {
      return {

        translate: (msg) => $q.when($translate(msg)),

        toastRaw: (msg) => {
          return Materialize.toast(msg, 4000);
        },

        toast: (msg) => {
          return $q.when($translate(msg)).then((translated) => Materialize.toast(translated, 4000))
        },

        enableInputs: () => $('i.prefix, label[value!=""]').addClass('active'),

        enableTabs: () => {
          let jTabs = $('ul.tabs');
          jTabs.tabs();
          $('ul.tabs a').click((e) => {
            let href = $(e.currentTarget).attr('href');
            let state = href.slice(1);
            $state.go(state);
          });

          let currentID = $location.path()
            .replace(/\//g, '.')
            .replace(/\./, '');

          jTabs.tabs('select_tab', currentID);
        },

        changeTitle: (version, currency, prefix) =>{ 
          let printCurrency = "";
          if (typeof(currency) != "undefined" && currency != null) {
            printCurrency = currency
            if (currency == "g1" || currency == "g1-test") {
              printCurrency = currency = 'ğ' + currency.slice(1)
            }
          }
          return document.title = (typeof(prefix) != "undefined" && prefix!=1) ? 'Duniter ' + version + ' : ' + printCurrency + '-' + prefix:'Duniter ' + version + ' : ' + printCurrency
        }
      }
    });
};
