#!/usr/bin/env node
"use strict";

const co = require('co');
const duniter = require('duniter');
const stack = duniter.statics.autoStack();

const modules = [
  require('../index')
];

for (const module of modules) {
  stack.registerDependency(module);
}

return co(function*(){
  yield stack.executeStack(process.argv);
  console.log('Done');
});

