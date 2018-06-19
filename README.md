parameter
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

[npm-image]: https://img.shields.io/npm/v/parameter.svg?style=flat-square
[npm-url]: https://npmjs.org/package/parameter
[travis-image]: https://img.shields.io/travis/node-modules/parameter.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/parameter
[codecov-image]: https://codecov.io/github/node-modules/parameter/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/parameter?branch=master
[download-image]: https://img.shields.io/npm/dm/parameter.svg?style=flat-square
[download-url]: https://npmjs.org/package/parameter

A parameter verify tools.

## Install

```bash
$ npm install parameter --save
```

## Usage

### API

`Parameter` Class

- `constructor([options])` - new Class `Parameter` instance
  - `options.translate` - translate function
  - `options.validateRoot` - config whether to validate the passed in value must be a object.
- `validate(rule, value)` - validate the `value` conforms to `rule`. return an array of errors if break rule.
- `addRule(type, check)` - add custom rules.
   - `type` - rule type, required and must be string type.
   - `check` - check handler. can be a `function` or a `RegExp`.

### Example

```js
var Parameter = require('parameter');

var parameter = new Parameter({
  translate: function() {
    var args = Array.prototype.slice.call(arguments);
    // Assume there have I18n.t method for convert language.
    return I18n.t.apply(I18n, args);
  },
  validateRoot: true, // restrict the being validate value must be a object
});

var data = {
  name: 'foo',
  age: 24,
  gender: 'male'
};

var rule = {
  name: 'string',
  age: 'int',
  gender: ['male', 'female', 'unknown']
};

var errors = parameter.validate(rule, data);
```

#### [complex example](example.js)

### Rule

#### common rule

- `required` - if `required` is set to false, this property can be empty. default to `true`.
- `type` - The type of property, every type has it's own rule for the validate.

#### int

If type is `int`, there has tow addition rules:

- `max` - The maximum of the value, `value` must <= `max`.
- `min` - The minimum of the value, `value` must >= `min`.

#### integer

Alias to `int`.

#### number

If type is `number`, there has tow addition rules:

- `max` - The maximum of the value, `value` must <= `max`.
- `min` - The minimum of the value, `value` must >= `min`.

#### date

The `date` type want to match `YYYY-MM-DD` type date string.

#### dateTime

The `dateTime` type want to match `YYYY-MM-DD HH:mm:ss` type date string.

#### datetime

Alias to `dateTime`.

#### id

The `id` type want to match `/^\d+$/` type date string.

#### boolean

Match `boolean` type value.

#### bool

Alias to `boolean`

#### string

If type is `string`, there has four addition rules:

- `allowEmpty`(alias to `empty`) - allow empty string, default to false.
- `format` - A `RegExp` to check string's format.
- `max` - The maximum length of the string.
- `min` - The minimum length of the string.

#### email

The `email` type want to match [RFC 5322](http://tools.ietf.org/html/rfc5322#section-3.4) email address.

- `allowEmpty` - allow empty string, default is false.

#### password

The `password` type want to match `/^$/` type string.

- `compare` - Compare field to check equal, default null, not check.
- `max` - The maximum length of the password.
- `min` - The minimum length of the password, default is 6.

#### url

The `url` type want to match [web url](https://gist.github.com/dperini/729294).

#### enum

If type is `enum`, it requires an addition rule:

- `values` - An array of data, `value` must be one on them. ___this rule is required.___

#### object

If type is `object`, there has one addition rule:

- `rule` - An object that validate the properties ot the object.

#### array

If type is `array`, there has four addition rule:

- `itemType` - The type of every item in this array.
- `rule` - An object that validate the items of the array. Only work with `itemType`.
- `max` - The maximun length of the array.
- `min` - The minimun lenght of the array.

#### abbr

- `'int'` => `{type: 'int', required: true}`
- `'integer'` => `{type: 'integer', required: true}`
- `'number'` => `{type: 'number', required: true}`
- `'date'` => `{type: 'date', required: true}`
- `'dateTime'` => `{type: 'dateTime', required: true}`
- `'id'` => `{type: 'id', required: true}`
- `'boolean'` => `{type: 'boolean', required: true}`
- `'bool'` => `{type: 'bool', required: true}`
- `'string'` => `{type: 'string', required: true, allowEmpty: false}`
- `'email'` => `{type: 'email', required: true, allowEmpty: false, format: EMAIL_RE}`
- `'password'` => `{type: 'password', required: true, allowEmpty: false, format: PASSWORD_RE, min: 6}`
- `'object'` => `{type: 'object', required: true}`
- `'array'` => `{type: 'array', required: true}`
- `[1, 2]` => `{type: 'enum', values: [1, 2]}`
- `/\d+/` => `{type: 'string', required: true, allowEmpty: false, format: /\d+/}`

## `errors` examples

### `code: missing_field`

```js
{
  code: 'missing_field',
  field: 'name',
  message: 'required'
}
```

### `code: invalid`

```js
{
  code: 'invalid',
  field: 'age',
  message: 'should be an integer'
}
```

## Release process

We're using [semantic-release](https://github.com/semantic-release/semantic-release) to run npm publish
after every commit on master.

See [Default Commit Message Format](https://github.com/semantic-release/semantic-release#default-commit-message-format) for details.

## License

[MIT](LICENSE.txt)
