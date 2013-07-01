parameter [![Build Status](https://secure.travis-ci.org/fengmk2/parameter.png)](http://travis-ci.org/fengmk2/parameter) [![Coverage Status](https://coveralls.io/repos/fengmk2/parameter/badge.png)](https://coveralls.io/r/fengmk2/parameter)
=======

![logo](https://raw.github.com/fengmk2/parameter/master/logo.png)

A parameter verify tools.

## Install

```bash
$ npm install parameter
```

## Docs

```js
/**
 * Verify data with rules.
 *
 * @param {Object} data input data parameters
 * @param {Object} rules verify rules
 *   {
 *     key1: parameter.Id, // must be string and number value, e.g.: '123', '043624'
 *     // key1: { isId: true },
 *     key2: parameter.Date, // must match 'YYYY-MM-DD' format date string, e.g.: '2013-06-25'
 *     // key2: { isDate: true },
 *     key3: parameter.DateTime, // must match 'YYYY-MM-DD hh:mm:ss' format date string, e.g.: '2013-06-25 12:20:50'
 *     // key3: { isDateTime: true },
 *     key4: 'number', // must match `typeof` result, could be 'number', 'string', 'function' or 'object' 
 *     // key4: { type: 'number' },
 *     key5: { required: false, type: 'number' }, // optional value, if set, must be a number
 *     key6: { required: false, type: parameter.Date }, // optional value, if set, must be a date string
 *     key7: { isArray: true, resourceName: 'User', rules: { name: 'string', age: 'number'  } }
 *     // key7: parameter.Array,
 *     // key7: { type: parameter.Array, resource: 'User', rules: { name: 'string', age: 'number'  } }
 *     key8: { isObject: true, resourceName: 'User', rules: { name: 'string', age: 'number'  } }
 *     // key8: parameter.Object,
 *     // key8: { type: parameter.Object, resource: 'User', rules: { name: 'string', age: 'number' } }
 *   }
 *   rules's keys must exists on `data`. If `data.key1` not exists, will got `missing_field` error.
 * @param {String} [resourceName] error resource name, default is 'Param'
 * 
 * @return {null|Array} errors, return null meaning no errors.
 *   e.g.: [{
 *     resource: 'Param',
 *     field: 'id',
 *     message: 'id required',
 *     code: 'missing_field'
 *   }, ... ]
 */
```

## Usage

```js
var p = require('parameter');

var data = {
  id: '043624',
  nick: '苏千',
  date: '2013-06-25',
  age: 29
};

var wrongData = {
  nick: 123,
  date: '2013-06-1',
  age: '29',
  sex: 0
};

var rules = {
  id: p.Id,
  nick: 'string',
  date: p.Date,
  age: 'number',
  sex: { required: false, type: 'string' }
};
var errors = p.verify(data, rules);
// errors => null

var errors = p.verify(wrongData, rules);
// errors =>
// [ { resource: 'Param',
//     field: 'id',
//     message: 'id required',
//     code: 'missing_field' },
//   { resource: 'Param',
//     field: 'nick',
//     message: 'expect string, but got number',
//     code: 'invalid' },
//   { resource: 'Param',
//     field: 'date',
//     message: 'should be "YYYY-MM-DD" date format string',
//     code: 'invalid' },
//   { resource: 'Param',
//     field: 'age',
//     message: 'expect number, but got string',
//     code: 'invalid' },
//   { resource: 'Param',
//     field: 'sex',
//     message: 'expect string, but got number',
//     code: 'invalid' } ]
```

## Performance

```bash
$ node benchmark.js

rules pass: {id: p.Id} x 6,023,826 ops/sec ±0.87% (99 runs sampled)
rules pass: {id: {type: p.Id}} x 4,207,059 ops/sec ±0.92% (98 runs sampled)
rules pass: {id: {idId: true}} x 4,101,462 ops/sec ±5.28% (92 runs sampled)
rules pass: {date: p.Date} x 3,421,468 ops/sec ±1.19% (92 runs sampled)
rules pass: {date: {type: p.Date}} x 3,577,401 ops/sec ±1.71% (92 runs sampled)
rules pass: {date: {isDate: true}} x 3,893,278 ops/sec ±0.84% (100 runs sampled)
rules pass: {time: p.DateTime} x 3,705,611 ops/sec ±2.07% (93 runs sampled)
rules pass: {time: {type: p.DateTime}} x 3,734,069 ops/sec ±1.96% (93 runs sampled)
rules pass: {time: {isDateTime: true}} x 3,739,484 ops/sec ±1.68% (92 runs sampled)
rules pass: {age: "number"} x 6,098,496 ops/sec ±0.74% (95 runs sampled)
rules pass: {age: {type: "number"}} x 6,391,140 ops/sec ±0.93% (92 runs sampled)
rules pass: {nick: "string"} x 5,995,432 ops/sec ±0.70% (98 runs sampled)
rules pass: {nick: {type: "string"}} x 6,215,072 ops/sec ±1.04% (96 runs sampled)
rules pass: {not_exists: "string", required: false} x 1,175,066 ops/sec ±1.39% (98 runs sampled)

Fastest is rules pass: {age: {type: "number"}}
```

## License 

(The MIT License)

Copyright (c) 2013 fengmk2 &lt;fengmk2@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
