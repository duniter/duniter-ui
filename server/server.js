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

stack.registerDependency({
  duniter: {
    cli: [{
      name: 'hello',
      desc: 'Says hello to the world.',
      requires: ['service'],
      promiseCallback: (duniterServer) => co(function*(){
        console.log('Hello, world.');
      })
    }]
  }
});

return co(function*(){
  yield stack.executeStack();
  console.log('Done');
});

