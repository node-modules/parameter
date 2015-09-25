/**!
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var Benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');
var Parameter = require('./');

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

var globalParameter = new Parameter();

rules.forEach(function (rule) {
  suite.add('globalParameter: verify ' + json(rule), function () {
    globalParameter.validate(rule, data);
  });

  suite.add('localParameter: verify ' + json(rule), function () {
    var p = new Parameter();
    p.validate(rule, data);
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

// node version: v2.5.0, date: Fri Sep 25 2015 23:29:32 GMT+0800 (CST)
// Starting...
// 38 tests completed.
//
// globalParameter: verify {"id":"id"}                                              x 1,755,826 ops/sec ±1.14% (92 runs sampled)
// localParameter: verify {"id":"id"}                                               x 1,700,584 ops/sec ±1.11% (91 runs sampled)
// globalParameter: verify {"id":{"type":"id"}}                                     x 1,664,283 ops/sec ±1.26% (90 runs sampled)
// localParameter: verify {"id":{"type":"id"}}                                      x 1,654,914 ops/sec ±1.35% (91 runs sampled)
// globalParameter: verify {"date":"date"}                                          x 1,547,474 ops/sec ±1.22% (92 runs sampled)
// localParameter: verify {"date":"date"}                                           x 1,543,998 ops/sec ±1.00% (92 runs sampled)
// globalParameter: verify {"date":{"type":"date"}}                                 x 1,528,876 ops/sec ±1.17% (91 runs sampled)
// localParameter: verify {"date":{"type":"date"}}                                  x 1,531,417 ops/sec ±1.16% (93 runs sampled)
// globalParameter: verify {"time":"datetime"}                                      x 1,436,431 ops/sec ±1.16% (91 runs sampled)
// localParameter: verify {"time":"datetime"}                                       x 1,435,370 ops/sec ±1.14% (91 runs sampled)
// globalParameter: verify {"time":{"type":"datetime"}}                             x 1,412,463 ops/sec ±1.30% (92 runs sampled)
// localParameter: verify {"time":{"type":"datetime"}}                              x 1,399,845 ops/sec ±1.74% (91 runs sampled)
// globalParameter: verify {"age":"number"}                                         x 2,708,155 ops/sec ±1.27% (91 runs sampled)
// localParameter: verify {"age":"number"}                                          x 2,587,876 ops/sec ±1.33% (92 runs sampled)
// globalParameter: verify {"age":{"type":"number"}}                                x 2,607,889 ops/sec ±1.10% (93 runs sampled)
// localParameter: verify {"age":{"type":"number"}}                                 x 2,538,770 ops/sec ±1.31% (91 runs sampled)
// globalParameter: verify {"nick":"string"}                                        x 2,307,909 ops/sec ±1.13% (94 runs sampled)
// localParameter: verify {"nick":"string"}                                         x 2,206,572 ops/sec ±1.27% (92 runs sampled)
// globalParameter: verify {"nick":{"type":"string"}}                               x 2,296,899 ops/sec ±0.98% (94 runs sampled)
// localParameter: verify {"nick":{"type":"string"}}                                x 2,170,179 ops/sec ±1.52% (92 runs sampled)
// globalParameter: verify {"not_exists":"string","required":false}                 x   160,931 ops/sec ±1.15% (91 runs sampled)
// localParameter: verify {"not_exists":"string","required":false}                  x   158,010 ops/sec ±1.63% (93 runs sampled)
// globalParameter: verify {"sid1":{}}                                              x   266,353 ops/sec ±3.10% (87 runs sampled)
// localParameter: verify {"sid1":{}}                                               x   278,138 ops/sec ±1.61% (90 runs sampled)
// globalParameter: verify {"sid2":{"type":"string","format":{}}}                   x 1,711,115 ops/sec ±1.15% (90 runs sampled)
// localParameter: verify {"sid2":{"type":"string","format":{}}}                    x 1,712,745 ops/sec ±1.07% (95 runs sampled)
// globalParameter: verify {"unit":["y","m","d","w"]}                               x 2,763,750 ops/sec ±1.26% (90 runs sampled)
// localParameter: verify {"unit":["y","m","d","w"]}                                x 2,703,971 ops/sec ±1.17% (93 runs sampled)
// globalParameter: verify {"unit":{"type":"enum","values":["y","m","d","w"]}}      x 3,930,004 ops/sec ±1.43% (91 runs sampled)
// localParameter: verify {"unit":{"type":"enum","values":["y","m","d","w"]}}       x 3,839,268 ops/sec ±1.40% (92 runs sampled)
// globalParameter: verify {"unit":["yy","mm","dd","ww"]}                           x   186,797 ops/sec ±1.75% (92 runs sampled)
// localParameter: verify {"unit":["yy","mm","dd","ww"]}                            x   188,961 ops/sec ±1.30% (94 runs sampled)
// globalParameter: verify {"email":"email"}                                        x   370,479 ops/sec ±1.92% (89 runs sampled)
// localParameter: verify {"email":"email"}                                         x   376,473 ops/sec ±1.19% (90 runs sampled)
// globalParameter: verify {"password":{"type":"password","compare":"re-password"}} x 1,252,958 ops/sec ±1.12% (91 runs sampled)
// localParameter: verify {"password":{"type":"password","compare":"re-password"}}  x 1,232,913 ops/sec ±1.47% (90 runs sampled)
// globalParameter: verify {"url":"url"}                                            x   269,519 ops/sec ±1.15% (93 runs sampled)
// localParameter: verify {"url":"url"}                                             x   262,017 ops/sec ±1.23% (91 runs sampled)
