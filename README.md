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
 *     key9: /^\d+$/, // must match number or number string.
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
  age: 29,
  sid: 123, // or '123'
};

var wrongData = {
  nick: 123,
  date: '2013-06-1',
  age: '29',
  sex: 0,
  sid: '123foo'
};

var rules = {
  id: p.Id,
  nick: 'string',
  date: p.Date,
  age: 'number',
  sex: { required: false, type: 'string' },
  sid: /^\d+$/
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
//     code: 'invalid' },
//   { resource: 'Param',
//     field: 'sid',
//     message: 'should match /^\d+$/',
//     code: 'invalid' } ]
```

## Performance

```bash
$ node benchmark.js

rules pass: {id: p.Id} x 5,074,408 ops/sec ±3.18% (90 runs sampled)
rules pass: {id: {type: p.Id}} x 3,076,881 ops/sec ±8.20% (86 runs sampled)
rules pass: {id: {idId: true}} x 3,390,500 ops/sec ±1.98% (89 runs sampled)
rules pass: {date: p.Date} x 2,843,970 ops/sec ±3.75% (91 runs sampled)
rules pass: {date: {type: p.Date}} x 3,070,906 ops/sec ±2.18% (93 runs sampled)
rules pass: {date: {isDate: true}} x 3,346,604 ops/sec ±2.97% (93 runs sampled)
rules pass: {time: p.DateTime} x 3,073,399 ops/sec ±2.16% (92 runs sampled)
rules pass: {time: {type: p.DateTime}} x 2,937,585 ops/sec ±4.53% (84 runs sampled)
rules pass: {time: {isDateTime: true}} x 3,060,667 ops/sec ±1.75% (92 runs sampled)
rules pass: {age: "number"} x 5,127,739 ops/sec ±3.26% (87 runs sampled)
rules pass: {age: {type: "number"}} x 4,717,803 ops/sec ±2.44% (90 runs sampled)
rules pass: {nick: "string"} x 3,803,510 ops/sec ±1.69% (88 runs sampled)
rules pass: {nick: {type: "string"}} x 3,635,789 ops/sec ±1.95% (91 runs sampled)
rules pass: {not_exists: "string", required: false} x 1,015,538 ops/sec ±2.17% (92 runs sampled)
rules pass: {age: /^\d+$/} x 3,177,203 ops/sec ±2.41% (86 runs sampled)
rules pass: {age: {type: /^\d+$/}} x 3,055,727 ops/sec ±2.01% (87 runs sampled)
rules fail: {age: {type: /^\d+$/}} x 1,327,194 ops/sec ±2.52% (89 runs sampled)

Fastest is rules pass: {age: {type: "number"}}
```

## Authors

```bash
$ git summary 

 project  : parameter
 repo age : 6 weeks
 active   : 3 days
 commits  : 11
 files    : 13
 authors  : 
    11  fengmk2                 100.0%
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
