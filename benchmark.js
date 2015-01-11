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
  url: 'https://github.com/node-modules/parameter/compare/url?expand=1'
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

  { url: 'url'},
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

// node benchmark.js
// node version: v0.11.14, date: Mon Jan 12 2015 00:26:28 GMT+0800 (CST)
// Starting...
// 19 tests completed.

// verify {"id":"id"}                                              x 2,288,326 ops/sec ±1.33% (93 runs sampled)
// verify {"id":{"type":"id"}}                                     x 2,223,940 ops/sec ±1.63% (94 runs sampled)
// verify {"date":"date"}                                          x 2,137,169 ops/sec ±1.93% (91 runs sampled)
// verify {"date":{"type":"date"}}                                 x 2,198,088 ops/sec ±1.87% (91 runs sampled)
// verify {"time":"datetime"}                                      x 2,215,601 ops/sec ±1.30% (93 runs sampled)
// verify {"time":{"type":"datetime"}}                             x 2,153,529 ops/sec ±1.12% (94 runs sampled)
// verify {"age":"number"}                                         x 3,228,224 ops/sec ±1.39% (93 runs sampled)
// verify {"age":{"type":"number"}}                                x 3,199,251 ops/sec ±1.24% (96 runs sampled)
// verify {"nick":"string"}                                        x 2,679,151 ops/sec ±1.38% (92 runs sampled)
// verify {"nick":{"type":"string"}}                               x 2,704,384 ops/sec ±1.53% (95 runs sampled)
// verify {"not_exists":"string","required":false}                 x 1,180,709 ops/sec ±1.57% (95 runs sampled)
// verify {"sid1":{}}                                              x 1,640,462 ops/sec ±1.04% (91 runs sampled)
// verify {"sid2":{"type":"string","format":{}}}                   x 2,248,618 ops/sec ±2.31% (92 runs sampled)
// verify {"unit":["y","m","d","w"]}                               x 2,913,945 ops/sec ±1.12% (92 runs sampled)
// verify {"unit":{"type":"enum","values":["y","m","d","w"]}}      x 4,243,777 ops/sec ±1.27% (95 runs sampled)
// verify {"unit":["yy","mm","dd","ww"]}                           x 1,346,001 ops/sec ±2.98% (89 runs sampled)
// verify {"email":"email"}                                        x 1,956,788 ops/sec ±1.46% (92 runs sampled)
// verify {"password":{"type":"password","compare":"re-password"}} x 2,009,989 ops/sec ±1.91% (92 runs sampled)
// verify {"url":"url"}                                            x 1,222,091 ops/sec ±1.22% (92 runs sampled)
