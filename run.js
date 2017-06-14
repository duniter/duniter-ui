"use strict";

const co = require('co');

// Inject 'webstart' command if no argument was given
if (process.argv.length === 2) {
  process.argv.push('direct_webstart');
}

process.on('uncaughtException', (err) => {
  // Dunno why this specific exception is not caught
  if (err.code !== "EADDRNOTAVAIL" && err.code !== "EINVAL" && err.code !== "ENOENT") {
    process.exit(2);
  }
})

const stack = require('duniter').statics.autoStack([{
  name: 'duniter-ui',
  required: require('./index')
}]);

co(function*() {
  yield stack.executeStack(process.argv);
  process.exit();
});
