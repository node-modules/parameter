'use strict';

var should = require('should');
var util = require('util');
var Parameter = require('..');
var parameter = new Parameter();

var parameterWithRootValidate = new Parameter({
  validateRoot: true,
});

var parameterWithConvert = new Parameter({
  convert: true,
});

var parameterWithWidelyUndefined = new Parameter({
  widelyUndefined: true,
});

describe('parameter', () => {
  describe('required', () => {
    it('should required work fine', () => {
      var value = {int: 1};
      var rule = {int: {type: 'int', required: true}};
      parameter.validate(rule, {})[0].should.eql({
        code: 'missing_field',
        field: 'int',
        message: 'required'
      });
    });

    it('should not required work fine', () => {
      var value = {int: 1};
      var rule = {int: {type: 'int', required: false}};
      should.not.exist(parameter.validate(rule, {}));
    });

    it('should not required work fine with null', () => {
      var value = { int: 1 };
      var rule = { int: { type: 'int', required: false } };
      should.not.exist(parameter.validate(rule, { int: null }));
    });

    it('should not required work fine with ?', () => {
      var rule = { int: 'int?' };
      should.not.exist(parameter.validate(rule, {}));
      rule = { int: { type: 'int?' }};
      should.not.exist(parameter.validate(rule, {}));
    });

    it('should not required check ok', () => {
      var value = {int: 1.1};
      var rule = {int: {type: 'int', required: false}};
      parameter.validate(rule, value)[0].should.eql({
        code: 'invalid',
        field: 'int',
        message: 'should be an integer'
      });
    });
  });

  describe('validate', () => {
    it('should throw error when received a non object', () => {
        var value = null;
        var rule = {int: {type: 'int1', required: false}};
        let err;
        try {
          parameter.validate(rule, undefined)
        } catch (e) {
          err = e;
        }
      should(err.message).equal('Cannot read property \'int\' of undefined');
    });

    it('should invalid type throw', () => {
      (() => {
        var value = {int: 1.1};
        var rule = {int: {type: 'int1', required: false}};
        parameter.validate(rule, value);
      }).should.throw('rule type must be one of number, int, integer, string, id, date, dateTime, datetime, boolean, bool, array, object, enum, email, password, url, but the following type was passed: int1');
    });

    it('should throw without rule', () => {
      (() => {
        parameter.validate();
      }).should.throw('need object type rule');
    });

    it('should throw when rule is null', () => {
      (() => {
        parameter.validate({d: null}, {d: 1});
      }).should.throw('rule type must be one of number, int, integer, string, id, date, dateTime, datetime, boolean, bool, array, object, enum, email, password, url, but the following type was passed: undefined');
    });
  });

  describe('int', () => {
    it('should check ok', () => {
      var value = { int: 1 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      should.not.exist(parameter.validate(rule, value));
      should.not.exist(parameter.validate({int: 'int'}, value));
    });

    it('should check number error', () => {
      var value = { int: '1' };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should be an integer');
    });

    it('should check int error', () => {
      var value = { int: 1.1 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should be an integer');
    });

    it('should check max error', () => {
      var value = { int: 101 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should smaller than 100');
    });

    it('should check min error', () => {
      var value = { int: -1 };
      var rule = { int: {type: 'int', max: 100, min: 0 }};
      parameter.validate(rule, value)[0].message.should.equal('should bigger than 0');
    });
  });

  describe('number', () => {
    it('should check ok', () => {
      var value = { number: 1.1 };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      should.not.exist(parameter.validate(rule, value));
      should.not.exist(parameter.validate({number: 'number'}, value));
    });

    it('should check number error', () => {
      var value = { number: '1' };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should be a number');
    });

    it('should check NaN error', () => {
      var value = { number: NaN };
      var rule = { number: 'number' };
      parameter.validate(rule, value)[0].message.should.equal('should be a number');
    });

    it('should check max error', () => {
      var value = { number: 101 };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('should smaller than 100');
    });

    it('should check min error', () => {
      var value = { number: -1 };
      var rule = { number: {type: 'number', max: 100, min: 0 }};
      parameter.validate(rule, value)[0].message.should.equal('should bigger than 0');
    });
  });

  describe('string', () => {
    it('should check ok', () => {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 100, min: 1, format: /^\D+$/ }};
      should.not.exist(parameter.validate(rule, value));
      should.not.exist(parameter.validate({string: 'string'}, value));
      should.not.exist(parameter.validate({string: {type: 'string', allowEmpty: true}}, {string: ''}));
    });

    it('should check empty error', () => {
      var value = { string: '' };
      var rule = { string: 'string'};
      parameter.validate(rule, value)[0].message.should.equal('should not be empty');
      rule = { string: {type: 'string', empty: false }};
      parameter.validate(rule, value)[0].message.should.equal('should not be empty');
    });

    it('should check with rule.trim', () => {
      should.not.exist(parameter.validate({string: {type: 'string', trim: true, allowEmpty: true}}, {string: '    '}));
      parameter.validate({string: {type: 'string', trim: true}}, {string: '    '})[0].message.should.equal('should not be empty');
    });

    it('should check max error', () => {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 4, min: 1 }};
      parameter.validate(rule, value)[0].message.should.equal('length should smaller than 4');
    });

    it('should check min error', () => {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 100, min: 10 }};
      parameter.validate(rule, value)[0].message.should.equal('length should bigger than 10');
    });

    it('should check format error', () => {
      var value = {string: 'hello'};
      var rule = {string: /\d+/};
      parameter.validate(rule, value)[0].message.should.equal('should match /\\d+/');
    });

    it('should check allowEmpty with format ok', () => {
      var value = {string: ''};
      var rule = {string: { type: 'string', format: /\d+/, allowEmpty: true}};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check allowEmpty with min and max ok', () => {
      var value = {string: ''};
      var rule = {string: { type: 'string', min: 10, max: 100, allowEmpty: true}};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should allowEmpty default to true if required is false', () => {
      var value = { string: '' };
      var rule = { string: { type: 'string', format: /\d+/, required: false } };
      should.not.exist(parameter.validate(rule, value));
    });
  });

  describe('id', () => {
    it('should check ok', () => {
      var value = {id : '0524' };
      var rule = {id: 'id'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check allowEmpty ok', () => {
      [
        '231',
        '',
      ].forEach(function (id) {
        should.not.exist(parameter.validate({ name: { type: 'id', allowEmpty: true } }, { name: id }));
      });
    });

    it('should check id not ok', () => {
      var value = {id : '0524x' };
      var rule = {id: 'id'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^\\d+$/');
    });
  });


  describe('date', () => {
    it('should check ok', () => {
      var value = {date : '2014-11-11' };
      var rule = {date: 'date'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check date not ok', () => {
      var value = {date : '2014-xx-xx' };
      var rule = {date: 'date'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^\\d{4}\\-\\d{2}\\-\\d{2}$/');
    });

    it('should check allowEmpty ok', () => {
      [
        '2014-11-11',
        '',
      ].forEach(function (date) {
        should.not.exist(parameter.validate({ name: { type: 'date', allowEmpty: true } }, { name: date }));
      });
    });
  });

  describe('dateTime', () => {
    it('should check ok', () => {
      var value = {dateTime : '2014-11-11 00:00:00' };
      var rule = {dateTime: 'dateTime'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check dateTime not ok', () => {
      var value = {dateTime : '2014-11-11 00:xx:00' };
      var rule = {dateTime: 'dateTime'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^\\d{4}\\-\\d{2}\\-\\d{2} \\d{2}:\\d{2}:\\d{2}$/');
    });

    it('should datetime alias to dateTime', () => {
      var value = {datetime : '2014-11-11 00:00:00' };
      var rule = {datetime: 'dateTime'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check allowEmpty ok', () => {
      [
        '2014-11-11 00:00:00',
        '',
      ].forEach(function (datetime) {
        should.not.exist(parameter.validate({ name: { type: 'dateTime', allowEmpty: true } }, { name: datetime }));
      });
    });
  });

  describe('boolean', () => {
    it('should check ok', () => {
      var value = {boolean : true };
      var rule = {boolean: 'boolean'};
      should.not.exist(parameter.validate(rule, value));
      rule = {boolean: 'bool'};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should check boolean not ok', () => {
      var value = {boolean : '2014-11-11 00:xx:00' };
      var rule = {boolean: 'boolean'};
      parameter.validate(rule, value)[0].message.should.equal('should be a boolean');
    });
  });

  describe('enum', () => {
    it('should check ok', () => {
      var value = {enum : 1 };
      var rule = {enum: [1, 2, 3]};
      should.not.exist(parameter.validate(rule, value));
      rule = {enum: {type: 'enum', values: [1, 2, 3]}};
      should.not.exist(parameter.validate(rule, value));
    });

    it('should throw when no values', () => {
      (() => {
        parameter.validate({enum: {type: 'enum'}}, {enum: 1});
      }).should.throw('check enum need array type values');
    });

    it('should check enum not ok', () => {
      var value = {enum : 4 };
      var rule = {enum: [1, 2, 3]};
      parameter.validate(rule, value)[0].message.should.equal('should be one of 1, 2, 3');
    });
  });

  describe('email', () => {
    it('should check ok', () => {
      [
        'fengmk2@gmail.com',
        'dead-horse@qq.com',
        'fengmk2+github@gmail.com',
        'fengmk2@yahoo.com.cn',
        'Fengmk2@126.Com',
      ].forEach(function (email) {
        should.not.exist(parameter.validate({ name: 'email' }, { name: email }));
        should.not.exist(parameter.validate({ name: { type: 'email' } }, { name: email }));
      });
    });

    it('should check allowEmpty ok', () => {
      [
        'fengmk2@gmail.com',
        '',
      ].forEach(function (email) {
        should.not.exist(parameter.validate({ name: { type: 'email', allowEmpty: true } }, { name: email }));
      });
    });

    it('should check fail', () => {
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

        parameter.validate({ name: { type: 'email', message: '错误 email' } }, { name: email }).should.eql([
          {
            code: 'invalid',
            field: 'name',
            message: '错误 email'
          }
        ]);
      });
    });
  });

  describe('password', () => {
    it('should check ok', () => {
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

    it('should check fail', () => {
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

      parameter.validate({
        password: {
          type: 'password',
          min: 4,
          compare: 're-password'
        }
      }, {
        password: '1',
        're-password': '1',
      }).should.eql([
        {
          code: 'invalid',
          field: 'password',
          message: 'length should bigger than 4'
        }
      ]);
    });
  });

  describe('url', () => {
    it('should check ok', () => {
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

    it('should check fail', () => {
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

        parameter.validate({ name: { type: 'url', message: '不合法 url' } }, { name: url }).should.eql([
          {
            code: 'invalid',
            field: 'name',
            message: '不合法 url'
          }
        ]);
      });
    });
  });

  describe('object', () => {
    it('should check ok', () => {
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

    it('should check object', () => {
      var value = {object: 1};
      var rule = {object: 'object'};
      parameter.validate(rule, value)[0].message.should.equal('should be an object');
    });

    it('should check error', () => {
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

  describe('array', () => {
    it('should check ok', () => {
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

    it('should check array', () => {
      var value = {array: 1};
      var rule = {array: 'array'};
      parameter.validate(rule, value)[0].message.should.equal('should be an array');
    });

    it('should invalid itemType throw error', () => {
      var rule = {array: {type: 'array', itemType: 'invalid'}};
      (() => {
         parameter.validate(rule, {array: []});
       }).should.throw('rule type must be one of number, int, integer, string, id, date, dateTime, datetime, boolean, bool, array, object, enum, email, password, url, but the following type was passed: invalid');
    });

    it('should check max error', () => {
      var value = {array: [0, 1, 2, 3, 4]};
      var rule = {array: {type: 'array', itemType: 'int', max: 4, min: 1}};
      parameter.validate(rule, value)[0].message.should.equal('length should smaller than 4');
    });

    it('should check min error', () => {
      var value = {array: [0, 1, 2, 3, 4]};
      var rule = {array: {type: 'array', itemType: 'int', max: 100, min: 10}};
      parameter.validate(rule, value)[0].message.should.equal('length should bigger than 10');
    });

    it('should check itemType=object error', () => {
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

    it('should check itemType=string error', () => {
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

  describe('addRule', () => {
    it('should throw without type', () => {
      (() => {
        parameter.addRule();
      }).should.throw('`type` required');
      (() => {
        Parameter.addRule();
      }).should.throw('`type` required');
    });

    it('should throw error when override exists rule', () => {
      (() => {
        parameter.addRule('string', function() {}, false);
      }).should.throw('rule `string` exists');
      (() => {
        Parameter.addRule('string', function() {}, false);
      }).should.throw('rule `string` exists');
    });

    it('should throw without check', () => {
      (() => {
        parameter.addRule('type');
      }).should.throw('check must be function or regexp');
    });

    it('should add with function', () => {
      parameter.addRule('prefix', function (rule, value) {
        if (value.indexOf(rule.prefix) !== 0) {
          return 'should start with ' + rule.prefix;
        }
      });

      var rule = {key: {type: 'prefix', prefix: 'prefix'}};
      var value = {key: 'not-prefixed'};
      parameter.validate(rule, value)[0].message.should.equal('should start with prefix');
    });

    it('should add with regexp', () => {
      parameter.addRule('prefix', /^prefix/);
      var rule = {key: 'prefix'};
      var value = {key: 'not-prefixed'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^prefix/');
    });

    it('should add with regexp on global', () => {
      Parameter.addRule('prefix2', /^prefix/);
      var rule = {key: 'prefix2'};
      var value = {key: 'not-prefixed'};
      parameter.validate(rule, value)[0].message.should.equal('should match /^prefix/');
    });

    it('should add work with required false by ?', () => {
      parameter.addRule('prefix', function (rule, value) {
        if (value.indexOf(rule.prefix) !== 0) {
          return 'should start with ' + rule.prefix;
        }
      });
      should.not.exist(parameter.validate({ foo: 'prefix?' }, {}));
      parameter.validate({ foo: { type: 'prefix', prefix: 'hello' } }, {})[0].message.should.equal('required');
      parameter.validate({ foo: { type: 'prefix', prefix: 'hello' } }, { foo: 'world' })[0].message.should.equal('should start with hello');
    });

    it('should add rule support function convertType', () => {
      parameter.addRule('httpBoolean', Parameter.TYPE_MAP['boolean'], false, (value, obj) => {
        if (value === 'false' || value === '0') return false;
        return !!value;
      });

      const obj = {
        a: 'false',
        b: '0',
        c: true,
        d: false,
        e: 1,
        f: 0,
        g: null,
        h: undefined,
        i: '',
        j: NaN,
        k: '00',
        l: '\t',
      };
      should.not.exist(parameterWithConvert.validate({
        a: 'httpBoolean',
        b: 'httpBoolean',
        c: 'httpBoolean',
        d: 'httpBoolean',
        e: 'httpBoolean',
        f: 'httpBoolean',
        g: 'httpBoolean?',
        h: 'httpBoolean?',
        i: 'httpBoolean',
        j: 'httpBoolean',
        k: 'httpBoolean',
        l: 'httpBoolean',
      }, obj));
      obj.should.eql({
        a: false,
        b: false,
        c: true,
        d: false,
        e: true,
        f: false,
        g: null,
        h: undefined,
        i: false,
        j: false,
        k: true,
        l: true,
      });
    });

    it('should add rule support function convertType used without convert', () => {
      const obj = {
        a: 'false',
        b: '0',
        c: true,
        d: false,
        e: 1,
        f: 0,
        g: null,
        h: undefined,
        i: '',
        j: NaN,
        k: '00',
        l: '\t',
      };
      should.not.exist(parameter.validate({
        a: { type: 'httpBoolean', convertType: 'httpBoolean' },
        b: { type: 'httpBoolean', convertType: 'httpBoolean' },
        c: { type: 'httpBoolean', convertType: 'httpBoolean' },
        d: { type: 'httpBoolean', convertType: 'httpBoolean' },
        e: { type: 'httpBoolean', convertType: 'httpBoolean' },
        f: { type: 'httpBoolean', convertType: 'httpBoolean' },
        g: { type: 'httpBoolean', convertType: 'httpBoolean', required: false },
        h: { type: 'httpBoolean', convertType: 'httpBoolean', required: false },
        i: { type: 'httpBoolean', convertType: 'httpBoolean' },
        j: { type: 'httpBoolean', convertType: 'httpBoolean' },
        k: { type: 'httpBoolean', convertType: 'httpBoolean' },
        l: { type: 'httpBoolean', convertType: 'httpBoolean' },
      }, obj));
      obj.should.eql({
        a: false,
        b: false,
        c: true,
        d: false,
        e: true,
        f: false,
        g: null,
        h: undefined,
        i: false,
        j: false,
        k: true,
        l: true,
      });
    });

    it('should add rule support string convertType', () => {
      parameter.addRule('httpBoolean2', Parameter.TYPE_MAP['boolean'], false, 'boolean');

      const obj = {
        a: 'false',
        b: '0',
        c: true,
        d: false,
        e: 1,
        f: 0,
        g: null,
        h: undefined,
        i: '',
        j: NaN,
        k: '00',
        l: '\t',
      };
      should.not.exist(parameterWithConvert.validate({
        a: 'httpBoolean2',
        b: 'httpBoolean2',
        c: 'httpBoolean2',
        d: 'httpBoolean2',
        e: 'httpBoolean2',
        f: 'httpBoolean2',
        g: 'httpBoolean2?',
        h: 'httpBoolean2?',
        i: 'httpBoolean2',
        j: 'httpBoolean2',
        k: 'httpBoolean2',
        l: 'httpBoolean2',
      }, obj));
      obj.should.eql({
        a: true,
        b: true,
        c: true,
        d: false,
        e: true,
        f: false,
        g: null,
        h: undefined,
        i: false,
        j: false,
        k: true,
        l: true,
      });
    });

    it('should add rule support string convertType ignore override', () => {
      parameter.addRule('httpBoolean3', Parameter.TYPE_MAP['boolean'], 'boolean');

      const obj = {
        a: 'false',
        b: '0',
        c: true,
        d: false,
        e: 1,
        f: 0,
        g: null,
        h: undefined,
        i: '',
        j: NaN,
        k: '00',
        l: '\t',
      };
      should.not.exist(parameterWithConvert.validate({
        a: 'httpBoolean3',
        b: 'httpBoolean3',
        c: 'httpBoolean3',
        d: 'httpBoolean3',
        e: 'httpBoolean3',
        f: 'httpBoolean3',
        g: 'httpBoolean3?',
        h: 'httpBoolean3?',
        i: 'httpBoolean3',
        j: 'httpBoolean3',
        k: 'httpBoolean3',
        l: 'httpBoolean3',
      }, obj));
      obj.should.eql({
        a: true,
        b: true,
        c: true,
        d: false,
        e: true,
        f: false,
        g: null,
        h: undefined,
        i: false,
        j: false,
        k: true,
        l: true,
      });
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


describe('validate with option.validateRoot', () => {
  it('should not pass when received a invalid value', () => {
    var value = null;
    var rule = { int: { type: 'int1', required: false } };
    parameterWithRootValidate.validate(rule, value)[0].message.should.equal('the validated value should be a object');;
  });
});

describe('validate with options.convert', function() {
  it('should convert to specific type by default', () => {
    var value = {
      int: '1.1',
      number: '1.23',
      string: 123,
      boolean: 'foo',
      regexp: 567,
      id: 888,
    };
    parameterWithConvert.validate({
      int: 'int',
      number: 'number',
      string: 'string',
      boolean: 'boolean',
      regexp: /\d+/,
      id: 'id',
    }, value);
    value.should.eql({
      int: 1,
      number: 1.23,
      string: '123',
      boolean: true,
      regexp: '567',
      id: '888'
    });
  });

  it('should convert to boolean', () => {
    var value = {
      a: '0',
      b: '',
      c: 0,
      d: 1,
      e: 'false',
      f: 'true',
      g: true,
      h: false,
      n: null,
      u: undefined,
      i: NaN,
      j: Infinity,
    };
    parameterWithConvert.validate({
      a: 'boolean',
      b: 'boolean',
      c: 'boolean',
      d: 'boolean',
      e: 'boolean',
      f: 'boolean',
      g: 'boolean',
      h: 'boolean',
      n: 'boolean',
      u: 'boolean',
      i: 'boolean',
      j: 'boolean',
    }, value);
    value.should.eql({
      a: true,
      b: false,
      c: false,
      d: true,
      e: true,
      f: true,
      g: true,
      h: false,
      n: null,
      u: undefined,
      i: false,
      j: true,
    });
  });

  it('should convertType support customize', () => {
    var value = { int: 123 };
    var res = parameterWithConvert.validate({
      int: {
        type: 'int',
        convertType: 'string',
      },
    }, value);
    res[0].message.should.equal('should be an integer');
    value.int.should.equal('123');
  });

  it('should convertType not work with object', () => {
    var value = { int: {} };
    var res = parameterWithConvert.validate({
      int: 'int',
    }, value);
    res[0].message.should.equal('should be an integer');
    value.int.should.eql({});
  });

  it('should convertType support function', () => {
    var value = { int: 'x' };
    var res = parameterWithConvert.validate({
      int: {
        type: 'int',
        convertType(v, obj) {
          obj.should.equal(value);
          if (v === 'x') return 1;
          return 0;
        },
      },
    }, value);
    should.not.exist(res);
    value.int.should.equal(1);
  });

  describe('validate with options.widelyUndefined', () => {
    it('should convert null / NaN / "" to undefiend', () => {
      var value = {
        number: NaN,
        string: '',
        trimString: '   ',
        date: null,
        foo: 'test string',
        bar: 123,
        byRule: '',
      };
      var res = parameterWithWidelyUndefined.validate({
        number: 'number?',
        string: 'string?',
        trimString: { type: 'string?', trim: true },
        date: 'date?',
        foo: 'string',
        bar: 'int',
        byRule: { type: 'string?', widelyUndefined: false },
      }, value);
      should.not.exist(res);
      value.should.eql({
        number: undefined,
        string: undefined,
        trimString: undefined,
        date: undefined,
        foo: 'test string',
        bar: 123,
        byRule: '',
      });
    });
  });

  describe('default', () => {
    it('should default work', () => {
      var value = {
        string: '',
        trimString: '\t\t\t\n   ',
        foo: null,
        bar: 123,
      };
      var res = parameter.validate({
        string: { type: 'string?', default: 'string' },
        trimString: { type: 'string?', trim: true, default: 'trimString' },
        foo: { type: 'string?', default: 'foo' },
        bar: { type: 'int?', default: 1200 },
        hello: { type: 'string?', default: 'world' },
        bool: { type: 'boolean?', default: false },
      }, value);
      should.not.exist(res);
      value.should.eql({
        string: '', // notice: string '' is not undefined here
        trimString: '',
        foo: 'foo',
        bar: 123,
        hello: 'world',
        bool: false,
      });
    });

    it('should default work with widelyUndefined', function() {
      var value = {
        number: NaN,
        string: '',
        trimString: '    ',
        date: null,
        foo: 'test string',
        bar: 123,
      };
      var res = parameterWithWidelyUndefined.validate({
        number: { type: 'number?', default: 100 },
        string: { type: 'string?', default: 'string' },
        trimString: { type: 'string?', trim: true, default: 'trimString' },
        date: { type: 'date?', default: 100 },
        foo: { type: 'string?', default: 'foo' },
        bar: { type: 'int?', default: 1200 },
        hello: { type: 'string?', default: 'world' },
      }, value);
      should.not.exist(res);
      value.should.eql({
        number: 100,
        string: 'string',
        trimString: 'trimString',
        date: 100,
        foo: 'test string',
        bar: 123,
        hello: 'world',
      });
    });
  });
});
