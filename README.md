parameter
=======

[![NPM version][npm-image]][npm-url]
[![Node.js CI](https://github.com/node-modules/parameter/actions/workflows/nodejs.yml/badge.svg)](https://github.com/node-modules/parameter/actions/workflows/nodejs.yml)
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/parameter.svg?style=flat-square
[npm-url]: https://npmjs.org/package/parameter
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
  - `options.validateRoot` - config whether to validate the passed in value must be a object, default to `false`.
  - `options.convert` - convert primitive params to specific type, default to `false`.
  - `options.widelyUndefined` - convert empty string(`''`), NaN, Null to undefined, this option can make `rule.required` more powerful, default to `false`.__This may change the original input params__.
- `validate(rule, value)` - validate the `value` conforms to `rule`. return an array of errors if break rule.
- `addRule(type, check)` - add custom rules.
   - `type` - rule type, required and must be string type.
   - `check` - check handler. can be a `function` or a `RegExp`.

__Note: when `options.convert` enabled, all built-in rules check for primitive input param and convert it to rule's default `convertType`(which defined below), you can also enable this feature for specific rule by `convertType` options in each rule definition.__

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

- `required` - if `required` is set to false, this property can be null or undefined. default to `true`.
- `type` - The type of property, every type has it's own rule for the validate.
- `convertType` - Make parameter convert the input param to the specific type, support `int`, `number`, `string` and `boolean`, also support a function to customize your own convert method.
- `default` - The default value of property, once the property is allowed non-required and missed, parameter will use this as the default value. __This may change the original input params__.
- `widelyUndefined` - override `options.widelyUndefined`

__Note: you can combile require and type end with a notation `?` like: `int?` or `string?` to specific both type and non-required.__

#### int

If type is `int`, there has tow addition rules:

- `max` - The maximum of the value, `value` must <= `max`.
- `min` - The minimum of the value, `value` must >= `min`.

Default `convertType` is `int`.

__Note: default `convertType` will only work when `options.convert` set to true in parameter's constructor.__

#### integer

Alias to `int`.

#### number

If type is `number`, there has tow addition rules:

- `max` - The maximum of the value, `value` must <= `max`.
- `min` - The minimum of the value, `value` must >= `min`.

Default `convertType` is `number`.

#### date

The `date` type want to match `YYYY-MM-DD` type date string.

Default `convertType` is `string`.

#### dateTime

The `dateTime` type want to match `YYYY-MM-DD HH:mm:ss` type date string.

Default `convertType` is `string`.

#### datetime

Alias to `dateTime`.

#### id

The `id` type want to match `/^\d+$/` type date string.

Default `convertType` is `string`.

#### boolean

Match `boolean` type value.

Default `convertType` is `boolean`.

#### bool

Alias to `boolean`

#### string

If type is `string`, there has four addition rules:

- `allowEmpty`(alias to `empty`) - allow empty string, default to false. If `rule.required` set to false, `allowEmpty` will be set to `true` by default.
- `format` - A `RegExp` to check string's format.
- `max` - The maximum length of the string.
- `min` - The minimum length of the string.
- `trim` - Trim the string before check, default is `false`.

Default `convertType` is `string`.

#### email

The `email` type want to match [RFC 5322](http://tools.ietf.org/html/rfc5322#section-3.4) email address.

- `allowEmpty` - allow empty string, default is false.

Default `convertType` is `string`.

#### password

The `password` type want to match `/^$/` type string.

- `compare` - Compare field to check equal, default null, not check.
- `max` - The maximum length of the password.
- `min` - The minimum length of the password, default is 6.

Default `convertType` is `string`.

#### url

The `url` type want to match [web url](https://gist.github.com/dperini/729294).

Default `convertType` is `string`.

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
- `max` - The maximum length of the array.
- `min` - The minimum lenght of the array.

#### abbr

- `'int'` => `{type: 'int', required: true}`
- `'int?'` => `{type: 'int', required: false }`
- `'integer'` => `{type: 'integer', required: true}`
- `'number'` => `{type: 'number', required: true}`
- `'date'` => `{type: 'date', required: true}`
- `'dateTime'` => `{type: 'dateTime', required: true}`
- `'id'` => `{type: 'id', required: true}`
- `'boolean'` => `{type: 'boolean', required: true}`
- `'bool'` => `{type: 'bool', required: true}`
- `'string'` => `{type: 'string', required: true, allowEmpty: false}`
- `'string?'` => `{type: 'string', required: false, allowEmpty: true}`
- `'email'` => `{type: 'email', required: true, allowEmpty: false, format: EMAIL_RE}`
- `'password'` => `{type: 'password', required: true, allowEmpty: false, format: PASSWORD_RE, min: 6}`
- `'object'` => `{type: 'object', required: true}`
- `'array'` => `{type: 'array', required: true}`
- `[1, 2]` => `{type: 'enum', values: [1, 2]}`
- `/\d+/` => `{type: 'string', required: true, allowEmpty: false, format: /\d+/}`

### `errors` examples

#### `code: missing_field`

```js
{
  code: 'missing_field',
  field: 'name',
  message: 'required'
}
```

#### `code: invalid`

```js
{
  code: 'invalid',
  field: 'age',
  message: 'should be an integer'
}
```

## License

[MIT](LICENSE.txt)

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/985607?v=4" width="100px;"/><br/><sub><b>dead-horse</b></sub>](https://github.com/dead-horse)<br/>|[<img src="https://avatars.githubusercontent.com/u/5518?v=4" width="100px;"/><br/><sub><b>huacnlee</b></sub>](https://github.com/huacnlee)<br/>|[<img src="https://avatars.githubusercontent.com/u/143572?v=4" width="100px;"/><br/><sub><b>hotoo</b></sub>](https://github.com/hotoo)<br/>|[<img src="https://avatars.githubusercontent.com/u/2039144?v=4" width="100px;"/><br/><sub><b>sang4lv</b></sub>](https://github.com/sang4lv)<br/>|[<img src="https://avatars.githubusercontent.com/u/471928?v=4" width="100px;"/><br/><sub><b>ghostoy</b></sub>](https://github.com/ghostoy)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
[<img src="https://avatars.githubusercontent.com/u/12657964?v=4" width="100px;"/><br/><sub><b>beliefgp</b></sub>](https://github.com/beliefgp)<br/>|[<img src="https://avatars.githubusercontent.com/u/5825244?v=4" width="100px;"/><br/><sub><b>taylorharwin</b></sub>](https://github.com/taylorharwin)<br/>|[<img src="https://avatars.githubusercontent.com/u/3199140?v=4" width="100px;"/><br/><sub><b>tomowang</b></sub>](https://github.com/tomowang)<br/>|[<img src="https://avatars.githubusercontent.com/u/11374721?v=4" width="100px;"/><br/><sub><b>hdumok</b></sub>](https://github.com/hdumok)<br/>|[<img src="https://avatars.githubusercontent.com/u/7971415?v=4" width="100px;"/><br/><sub><b>paranoidjk</b></sub>](https://github.com/paranoidjk)<br/>|[<img src="https://avatars.githubusercontent.com/u/30565051?v=4" width="100px;"/><br/><sub><b>zcxsythenew</b></sub>](https://github.com/zcxsythenew)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Tue Apr 05 2022 10:44:22 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
