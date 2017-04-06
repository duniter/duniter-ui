"use strict";

const co = require('co');

// Inject 'webstart' command if no argument was given
if (process.argv.length === 2) {
  process.argv.push('direct_webstart');
}

const stack = require('duniter').statics.autoStack([{
  name: 'duniter-ui',
  required: require('./index')
}]);

co(function*() {
  yield stack.executeStack(process.argv);
  process.exit();
});
