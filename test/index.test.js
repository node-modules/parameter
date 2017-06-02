/**
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *  dead_horse <dead_horse@qq.com>
 */

'use strict';

/**
 * Module dependencies.
 */

var should = require('should');
var util = require('util');
var Parameter = require('..');
var parameter = new Parameter();

describe('parameter', function () {
  describe('required', function () {
    it('should required work fine', function () {
      var value = {int: 1};
      var rule = {int: {type: 'int', required: true}};
      parameter.validate(rule, {})[0].should.eql({
        code: 'missing_field',
        field: 'int',
        message: 'required'
      });
    });

    it('should not required work fine', function () {
      var value = {int: 1};
      var rule = {int: {type: 'int', required: false}};
      should.not.exist(parameter.validate(rule, {}));
    });

    it('should not required check ok', function () {
      var value = {int: 1.1};
      var rule = {int: {type: 'int', required: false}};
      parameter.validate(rule, value)[0].should.eql({
        code: 'invalid',
        field: 'int',
        message: 'should be an integer'
      });
    });
  });

  describe('validate', function () {
    it('should invalid type throw', function () {
      (function () {
        var value = {int: 1.1};
        var rule = {int: {type: 'int1', required: false}};
        parameter.validate(rule, value);
      }).should.throw('rule type must be one of number, int, integer, string, id, date, dateTime, datetime, boolean, bool, array, object, enum, email, password, url, but the following type was passed: int1');
    });

    it('should throw without rule', function () {
      (function () {
        parameter.validate();
      }).should.throw('need object type rule');
    });

    it('should throw when rule is null', function () {
      (function () {
        parameter.validate({d: null}, {d: 1});
      }).should.throw('rule type must be one of number, int, integer, string, id, date, dateTime, datetime, boolean, bool, array, object, enum, email, password, url, but the following type was passed: undefined');
    });
  });

  describe('int', function () {
    it('should check ok', function () {
      var value = { int: 1 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      should.not.exist(parameter.validate(rule, value));
      should.not.exist(parameter.validate({int: 'int'}, value));
    });

    it('should check number error', function () {
      var value = { int: '1' };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should be an integer');
    });

    it('should check int error', function () {
      var value = { int: 1.1 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should be an integer');
    });

    it('should check max error', function () {
      var value = { int: 101 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should smaller than 100');
    });

    it('should check min error', function () {
      var value = { int: -1 };
      var rule = { int: {type: 'int', max: 100, min: 0 }};
      parameter.validate(rule, value)[0].message.should.equal('should bigger than 0');
    });
  });

  describe('number', function () {
    it('should check ok', function () {
      var value = { number: 1.1 };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      should.not.exist(parameter.validate(rule, value));
      should.not.exist(parameter.validate({number: 'number'}, value));
    });

    it('should check number error', function () {
      var value = { number: '1' };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should be a number');
    });

    it('should check max error', function () {
      var value = { number: 101 };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should smaller than 100');
    });

    it('should check min error', function () {
      var value = { number: -1 };
      var rule = { number: {type: 'number', max: 100, min: 0 }};
      parameter.validate(rule, value)[0].message.should.equal('should bigger than 0');
    });
  });

  describe('string', function () {
    it('should check ok', function () {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 100, min: 1, format: /^\D+$/ }};
      should.not.exist(parameter.validate(rule, value));
      should.not.exist(parameter.validate({string: 'string'}, value));
      should.not.exist(parameter.validate({string: {type: 'string', allowEmpty: true}}, {string: ''}));
    });

    it('should check empty error', function () {
      var value = { string: '' };
      var rule = { string: 'string'};
      parameter.validate(rule, value)[0].message.should.equal('should not be empty');
      rule = { string: {type: 'string', empty: false }};
      parameter.validate(rule, value)[0].message.should.equal('should not be empty');
    });

    it('should check max error', function () {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 4, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('length should smaller than 4');
    });

    it('should check min error', function () {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 100, min: 10 }};
      parameter.validate(rule, value)[0].message.should.equal('length should bigger than 10');
    });

    it('should check format error', function () {
      var value = {string: 'hello'};
      var rule = {string: /\d+/};
      parameter.validate(rule, value)[0].message.should.equal('should match /\\d+/');
    });

    it('should check allowEmpty with format ok', function () {
      var value = {string: ''};
      var rule = {string: { type: 'string', format: /\d+/, allowEmpty: true}};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check allowEmpty with min and max ok', function () {
      var value = {string: ''};
      var rule = {string: { type: 'string', min: 10, max: 100, allowEmpty: true}};
      should.not.exist(parameter.validate(rule, value));
    });
  });

  describe('id', function () {
    it('should check ok', function () {
      var value = {id : '0524' };
      var rule = {id: 'id'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check allowEmpty ok', function () {
      [
        '231',
        '',
      ].forEach(function (id) {
        should.not.exist(parameter.validate({ name: { type: 'id', allowEmpty: true } }, { name: id }));
      });
    });

    it('should check id not ok', function () {
      var value = {id : '0524x' };
      var rule = {id: 'id'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^\\d+$/');
    });
  });


  describe('date', function () {
    it('should check ok', function () {
      var value = {date : '2014-11-11' };
      var rule = {date: 'date'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check date not ok', function () {
      var value = {date : '2014-xx-xx' };
      var rule = {date: 'date'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^\\d{4}\\-\\d{2}\\-\\d{2}$/');
    });

    it('should check allowEmpty ok', function () {
      [
        '2014-11-11',
        '',
      ].forEach(function (date) {
        should.not.exist(parameter.validate({ name: { type: 'date', allowEmpty: true } }, { name: date }));
      });
    });
  });

  describe('dateTime', function () {
    it('should check ok', function () {
      var value = {dateTime : '2014-11-11 00:00:00' };
      var rule = {dateTime: 'dateTime'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check dateTime not ok', function () {
      var value = {dateTime : '2014-11-11 00:xx:00' };
      var rule = {dateTime: 'dateTime'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^\\d{4}\\-\\d{2}\\-\\d{2} \\d{2}:\\d{2}:\\d{2}$/');
    });

    it('should datetime alias to dateTime', function () {
      var value = {datetime : '2014-11-11 00:00:00' };
      var rule = {datetime: 'dateTime'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check allowEmpty ok', function () {
      [
        '2014-11-11 00:00:00',
        '',
      ].forEach(function (datetime) {
        should.not.exist(parameter.validate({ name: { type: 'dateTime', allowEmpty: true } }, { name: datetime }));
      });
    });
  });

  describe('boolean', function () {
    it('should check ok', function () {
      var value = {boolean : true };
      var rule = {boolean: 'boolean'};
      should.not.exist(parameter.validate(rule, value));
      rule = {boolean: 'bool'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check boolean not ok', function () {
      var value = {boolean : '2014-11-11 00:xx:00' };
      var rule = {boolean: 'boolean'};
      parameter.validate(rule, value)[0].message.should.equal('should be a boolean');
    });
  });

  describe('enum', function () {
    it('should check ok', function () {
      var value = {enum : 1 };
      var rule = {enum: [1, 2, 3]};
      should.not.exist(parameter.validate(rule, value));
      rule = {enum: {type: 'enum', values: [1, 2, 3]}};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should throw when no values', function () {
      (function () {
        parameter.validate({enum: {type: 'enum'}}, {enum: 1});
      }).should.throw('check enum need array type values');
    });

    it('should check enum not ok', function () {
      var value = {enum : 4 };
      var rule = {enum: [1, 2, 3]};
      parameter.validate(rule, value)[0].message.should.equal('should be one of 1, 2, 3');
    });
  });

  describe('email', function () {
    it('should check ok', function () {
      [
        'fengmk2@gmail.com',
        'dead-horse@qq.com',
        'fengmk2+github@gmail.com',
        'fengmk2@yahoo.com.cn',
      ].forEach(function (email) {
        should.not.exist(parameter.validate({ name: 'email' }, { name: email }));
        should.not.exist(parameter.validate({ name: { type: 'email' } }, { name: email }));
      });
    });

    it('should check allowEmpty ok', function () {
      [
        'fengmk2@gmail.com',
        '',
      ].forEach(function (email) {
        should.not.exist(parameter.validate({ name: { type: 'email', allowEmpty: true } }, { name: email }));
      });
    });

    it('should check fail', function () {
      [
        'fengmk2@中文.域名',
        '.fengmk2@gmail.com',
        'dead-horse@qq.',
        'fengmk2+github@gmail',
        'fengmk2@yahoo.com.cn+',
      ].forEach(function (email) {
        parameter.validate({ name: 'email' }, { name: email }).should.eql([
          {
            code: 'invalid',
            field: 'name',
            message: 'should be an email'
          }
        ]);
      });
    });
  });

  describe('password', function () {
    it('should check ok', function () {
      should.not.exist(parameter.validate({
        password: {
          type: 'password',
          compare: 're-password'
        }
      }, {
        password: '123123~!@',
        're-password': '123123~!@',
      }));

      should.not.exist(parameter.validate({
        password: {
          type: 'password',
        }
      }, {
        password: '123123',
      }));
    });

    it('should check fail', function () {
      parameter.validate({
        password: {
          type: 'password',
          compare: 're-password'
        }
      }, {
        password: '123123',
        're-password': '1231231',
      }).should.eql([
        {
          code: 'invalid',
          field: 'password',
          message: 'should equal to re-password'
        }
      ]);

      parameter.validate({
        password: {
          type: 'password',
          compare: 're-password'
        }
      }, {
        password: '12312',
        're-password': '12312',
      }).should.eql([
        {
          code: 'invalid',
          field: 'password',
          message: 'length should bigger than 6'
        }
      ]);
    });
  });

  describe('url', function () {
    it('should check ok', function () {
      [
        'http://✪df.ws/123',
        'http://userid:password@example.com:8080',
        'http://userid:password@example.com:8080/',
        'http://userid@example.com',
        'http://userid@example.com/',
        'http://userid@example.com:8080',
        'http://userid@example.com:8080/',
        'http://userid:password@example.com',
        'http://userid:password@example.com/',
        'http://142.42.1.1/',
        'http://142.42.1.1:8080/',
        'http://➡.ws/䨹',
        'http://⌘.ws',
        'http://⌘.ws/',
        'http://foo.com/blah_(wikipedia)#cite-1',
        'http://foo.com/blah_(wikipedia)_blah#cite-1',
        'http://foo.com/unicode_(✪)_in_parens',
        'http://foo.com/(something)?after=parens',
        'http://☺.damowmow.com/',
        'http://code.google.com/events/#&product=browser',
        'http://j.mp',
        'ftp://foo.bar/baz',
        'http://foo.bar/?q=Test%20URL-encoded%20stuff',
        'http://مثال.إختبار',
        'http://例子.测试'
      ].forEach(function (url) {
        should.not.exist(parameter.validate({ name: 'url' }, { name: url }));
        should.not.exist(parameter.validate({ name: { type: 'url' } }, { name: url }));
      });
    });

    it('should check fail', function () {
      [
      'http://',
      'http://.',
      'http://..',
      'http://../',
      'http://?',
      'http://foo.bar?q=Spaces should be encoded',
      '//',
      '//a',
      '///a',
      'http:// shouldfail.com',
      ':// should fail',
      'http://foo.bar/foo(bar)baz quux',
      'ftps://foo.bar/',
      'http://-error-.invalid/',
      'http://-a.b.co',
      'http://a.b-.co',
      'http://0.0.0.0',
      'http://www.foo.bar./',
      'http://.www.foo.bar./',
      'http://10.1.1.1',
      'http://10.1.1.254'
      ].forEach(function (url) {
        parameter.validate({ name: 'url' }, { name: url }).should.eql([
          {
            code: 'invalid',
            field: 'name',
            message: 'should be a url'
          }
        ]);
      });
    });
  });

  describe('object', function () {
    it('should check ok', function () {
      var value = {
        object: {
          name: 'string',
          age: 20
        }
      };
      var rule = {
        object: {
          type: 'object',
          rule: {
            name: 'string',
            age: 'int'
          }
        }
      };
      should.not.exist(parameter.validate(rule, value));
      should.not.exist(parameter.validate({object: 'object'}, value));
    });

    it('should check object', function () {
      var value = {object: 1};
      var rule = {object: 'object'};
      parameter.validate(rule, value)[0].message.should.equal('should be an object');
    });

    it('should check error', function () {
      var value = {
        object: {
          name: 'string',
          age: '20'
        }
      };
      var rule = {
        object: {
          type: 'object',
          rule: {
            name: 'string',
            age: 'int'
          }
        }
      };
      var result = parameter.validate(rule, value)[0]
      result.message.should.equal('should be an integer');
      result.field.should.equal('object.age');
    });
  });

  describe('array', function () {
    it('should check ok', function () {
      var value = {
        array: [{
          name: 'string',
          age: 20
        }, {
          name: 'name',
          age: 21
        }]
      };
      var rule = {
        array: {
          type: 'array',
          itemType: 'object',
          rule: {
            name: 'string',
            age: 'int'
          }
        }
      };
      should.not.exist(parameter.validate(rule, value));
      should.not.exist(parameter.validate({array: 'array'}, value));
    });

    it('should check array', function () {
      var value = {array: 1};
      var rule = {array: 'array'};
      parameter.validate(rule, value)[0].message.should.equal('should be an array');
    });

    it('should invalid itemType throw error', function () {
      var rule = {array: {type: 'array', itemType: 'invalid'}};
      (function () {
         parameter.validate(rule, {array: []});
       }).should.throw('rule type must be one of number, int, integer, string, id, date, dateTime, datetime, boolean, bool, array, object, enum, email, password, url, but the following type was passed: invalid');
    });

    it('should check itemType=object error', function () {
      var value = {
        array: [{
          name: 22,
          age: 20
        }, {
          name: 'name',
          age: '21'
        }]
      };
      var rule = {
        array: {
          type: 'array',
          itemType: 'object',
          rule: {
            name: 'string',
            age: 'int'
          }
        }
      };
      parameter.validate(rule, value)[0].message.should.equal('should be a string');
      parameter.validate(rule, value)[1].message.should.equal('should be an integer');
    });

    it('should check itemType=string error', function () {
      var value = {
        array: ['test', 'foo', 1, '']
      };
      var rule = {
        array: {
          type: 'array',
          itemType: 'string'
        }
      };

      var rule2 = {
        array: {
          type: 'array',
          itemType: 'string',
          rule: {type: 'string', allowEmpty: true}
        }
      }
      parameter.validate(rule, value)[0].message.should.equal('should be a string');
      parameter.validate(rule, value)[1].message.should.equal('should not be empty');
      parameter.validate(rule2, value)[0].message.should.equal('should be a string');
      parameter.validate(rule2, value).should.have.length(1);
    });
  });

  describe('addRule', function () {
    it('should throw without type', function () {
      (function () {
        parameter.addRule();
      }).should.throw('`type` required');
    });

    it('should throw without check', function () {
      (function () {
        parameter.addRule('type');
      }).should.throw('check must be function or regexp');
    });

    it('should add with function', function () {
      parameter.addRule('prefix', function (rule, value) {
        if (value.indexOf(rule.prefix) !== 0) {
          return 'should start with ' + rule.prefix;
        }
      });

      var rule = {key: {type: 'prefix', prefix: 'prefix'}};
      var value = {key: 'not-prefixed'};
      parameter.validate(rule, value)[0].message.should.equal('should start with prefix');
    });

    it('should add with regexp', function () {
      parameter.addRule('prefix', /^prefix/);
      var rule = {key: 'prefix'};
      var value = {key: 'not-prefixed'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^prefix/');
    });
  });

  describe('custom translate function', function(){
    it('should work', function() {
      var translate = function() {
        var args = Array.prototype.slice.call(arguments);
        args[0] = args[0] + '-add.';
        return util.format.apply(util, args);
      };

      var p1 = new Parameter({ translate: translate });

      var rule = { name: 'string' };
      var error = p1.validate(rule, {})[0];
      error.message.should.equal('required-add.');
      error.code.should.equal('missing_field-add.');
      error.field.should.equal('name');
    });
  });
});
