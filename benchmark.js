/**!
 * parameter - benchmark.js
 *
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var Benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');
var verify = require('./');

var suite = new Benchmark.Suite();

var data = {
  id: '043624',
  nick: '苏千',
  date: '2013-06-25',
  time: '2013-06-25 01:12:22',
  age: 29,
  sid1: 123,
  sid2: '123',
  sid3: 'foo',
  unit: 'y',
  email: 'fengmk2@gmail.com',
  password: '!@#123',
  're-password': '!@#123',
};

var rules = [
  { id: 'id' },
  { id: { type: 'id' } },

  { date: 'date' },
  { date: { type: 'date' } },

  { time: 'datetime' },
  { time: { type: 'datetime' } },

  { age: 'number' },
  { age: { type: 'number' } },

  { nick: 'string'},
  { nick: { type: 'string' } },
  { not_exists: 'string', required: false },
  { sid1: /^\d+$/},
  { sid2: { type: 'string', format: /^\d+$/ } },
  // { sid3: { type: 'string', format: /^\d+$/, message: 'should be digital' } },

  { unit: ['y', 'm', 'd', 'w'] },
  { unit: { type: 'enum', values: ['y', 'm', 'd', 'w'] } },
  { unit: ['yy', 'mm', 'dd', 'ww'] },

  { email: 'email' },

  { password: { type: 'password', compare: 're-password' } },
];

function json(obj) {
  return JSON.stringify(obj);
}

rules.forEach(function (rule) {
  suite.add('verify ' + json(rule), function () {
    verify(rule, data);
  });
});

suite.on('cycle', function(event) {
  benchmarks.add(event.target);
})
.on('start', function(event) {
  console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
})
.on('complete', function done() {
  benchmarks.log();
})
.run({ 'async': false });

// $ node benchmark.js
//
// node version: v0.11.14, date: Thu Jan 08 2015 19:40:04 GMT+0800 (CST)
// Starting...
// 18 tests completed.
//
// verify {"id":"id"}                                              x 1,896,293 ops/sec ±5.38% (82 runs sampled)
// verify {"id":{"type":"id"}}                                     x 1,473,771 ops/sec ±11.77% (65 runs sampled)
// verify {"date":"date"}                                          x 1,513,462 ops/sec ±9.23% (73 runs sampled)
// verify {"date":{"type":"date"}}                                 x 1,563,038 ops/sec ±8.09% (76 runs sampled)
// verify {"time":"datetime"}                                      x 1,541,142 ops/sec ±6.58% (78 runs sampled)
// verify {"time":{"type":"datetime"}}                             x 1,735,154 ops/sec ±2.08% (87 runs sampled)
// verify {"age":"number"}                                         x 2,436,145 ops/sec ±5.15% (85 runs sampled)
// verify {"age":{"type":"number"}}                                x 2,467,326 ops/sec ±3.71% (84 runs sampled)
// verify {"nick":"string"}                                        x 2,094,849 ops/sec ±3.28% (86 runs sampled)
// verify {"nick":{"type":"string"}}                               x 2,106,839 ops/sec ±2.04% (89 runs sampled)
// verify {"not_exists":"string","required":false}                 x   846,973 ops/sec ±7.22% (77 runs sampled)
// verify {"sid1":{}}                                              x 1,404,479 ops/sec ±1.32% (89 runs sampled)
// verify {"sid2":{"type":"string","format":{}}}                   x 1,981,292 ops/sec ±1.62% (91 runs sampled)
// verify {"unit":["y","m","d","w"]}                               x 2,425,140 ops/sec ±1.30% (89 runs sampled)
// verify {"unit":{"type":"enum","values":["y","m","d","w"]}}      x 3,505,832 ops/sec ±3.03% (85 runs sampled)
// verify {"unit":["yy","mm","dd","ww"]}                           x 1,111,593 ops/sec ±2.30% (84 runs sampled)
// verify {"email":"email"}                                        x 1,117,493 ops/sec ±11.38% (61 runs sampled)
// verify {"password":{"type":"password","compare":"re-password"}} x   966,424 ops/sec ±11.80% (53 runs sampled)
