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

  { email: 'email' }
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
// node version: v0.11.14, date: Thu Jan 08 2015 15:31:08 GMT+0800 (CST)
// Starting...
// 16 tests completed.
//
// verify {"id":"id"}                                         x 2,115,641 ops/sec ±1.10% (91 runs sampled)
// verify {"id":{"type":"id"}}                                x 2,089,624 ops/sec ±2.24% (92 runs sampled)
// verify {"date":"date"}                                     x 1,784,996 ops/sec ±6.12% (83 runs sampled)
// verify {"date":{"type":"date"}}                            x 1,809,219 ops/sec ±3.81% (85 runs sampled)
// verify {"time":"datetime"}:
// verify {"time":{"type":"datetime"}}:
// verify {"age":"number"}                                    x 2,705,620 ops/sec ±1.74% (88 runs sampled)
// verify {"age":{"type":"number"}}                           x 2,575,615 ops/sec ±2.33% (85 runs sampled)
// verify {"nick":"string"}                                   x 2,140,266 ops/sec ±2.38% (85 runs sampled)
// verify {"nick":{"type":"string"}}                          x 2,149,018 ops/sec ±2.57% (87 runs sampled)
// verify {"not_exists":"string","required":false}            x   927,337 ops/sec ±6.10% (82 runs sampled)
// verify {"sid1":{}}                                         x 1,179,423 ops/sec ±5.53% (76 runs sampled)
// verify {"sid2":{"type":"string","format":{}}}              x 1,781,882 ops/sec ±2.90% (86 runs sampled)
// verify {"unit":["y","m","d","w"]}                          x 2,476,129 ops/sec ±1.48% (90 runs sampled)
// verify {"unit":{"type":"enum","values":["y","m","d","w"]}} x 3,617,270 ops/sec ±2.90% (85 runs sampled)
// verify {"unit":["yy","mm","dd","ww"]}                      x 1,122,732 ops/sec ±4.24% (85 runs sampled)
