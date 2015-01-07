/**
 * parameter - index.js
 *
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
var validate = require('..');

describe('parameter', function () {
  describe('required', function () {
    it('should required work fine', function () {
      var value = {int: 1};
      var rule = {int: {type: 'int', required: true}};
      validate({}, rule)[0].message.should.equal('int required');
    });

    it('should not required work fine', function () {
      var value = {int: 1};
      var rule = {int: {type: 'int', required: false}};
      should.not.exist(validate({}, rule));
    });

    it('should not required check ok', function () {
      var value = {int: 1.1};
      var rule = {int: {type: 'int', required: false}};
      validate(value, rule)[0].message.should.equal('int should be an integer');
    });
  });

  describe('validate', function () {
    it('should invalid type throw', function () {
      (function () {
        var value = {int: 1.1};
        var rule = {int: {type: 'int1', required: false}};
        validate(value, rule);
      }).should.throw('rule type must be one of number, int, integer, string, id, date, dateTime, boolean, bool, array, object, enum, but the following type was passed: int1');
    });

    it('should throw without rule', function () {
      (function () {
        var value = {int: 1.1};
        validate(value);
      }).should.throw('need object type rule');
    });
  });

  describe('int', function () {
    it('should check ok', function () {
      var value = { int: 1 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      should.not.exist(validate(value, rule));
      should.not.exist(validate(value, {int: 'int'}));
    });

    it('should check number error', function () {
      var value = { int: '1' };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      validate(value, rule)[0].message.should.equal('int should be an integer');
    });

    it('should check int error', function () {
      var value = { int: 1.1 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      validate(value, rule)[0].message.should.equal('int should be an integer');
    });

    it('should check max error', function () {
      var value = { int: 101 };
      var rule = { int: {type: 'int', max: 100, min: 1 }};
      validate(value, rule)[0].message.should.equal('int should smaller than 100');
    });

    it('should check min error', function () {
      var value = { int: -1 };
      var rule = { int: {type: 'int', max: 100, min: 0 }};
      validate(value, rule)[0].message.should.equal('int should bigger than 0');
    });
  });

  describe('number', function () {
    it('should check ok', function () {
      var value = { number: 1.1 };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      should.not.exist(validate(value, rule));
      should.not.exist(validate(value, {number: 'number'}));
    });

    it('should check number error', function () {
      var value = { number: '1' };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      validate(value, rule)[0].message.should.equal('number should be a number');
    });

    it('should check max error', function () {
      var value = { number: 101 };
      var rule = { number: {type: 'number', max: 100, min: 1 }};
      validate(value, rule)[0].message.should.equal('number should smaller than 100');
    });

    it('should check min error', function () {
      var value = { number: -1 };
      var rule = { number: {type: 'number', max: 100, min: 0 }};
      validate(value, rule)[0].message.should.equal('number should bigger than 0');
    });
  });

  describe('string', function () {
    it('should check ok', function () {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 100, min: 1, format: /^\D+$/ }};
      should.not.exist(validate(value, rule));
      should.not.exist(validate(value, {string: 'string'}));
      should.not.exist(validate({string: ''}, {string: 'string'}));
    });

    it('should check empty error', function () {
      var value = { string: '' };
      var rule = { string: {type: 'string', allowEmpty: false }};
      validate(value, rule)[0].message.should.equal('string should not be empty');
      rule = { string: {type: 'string', empty: false }};
      validate(value, rule)[0].message.should.equal('string should not be empty');
    });

    it('should check max error', function () {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 4, min: 1 }};
      validate(value, rule)[0].message.should.equal('string length should smaller than 4');
    });

    it('should check min error', function () {
      var value = { string: 'hello' };
      var rule = { string: {type: 'string', max: 100, min: 10 }};
      validate(value, rule)[0].message.should.equal('string length should bigger than 10');
    });

    it('should check format error', function () {
      var value = {string: 'hello'};
      var rule = {string: /\d+/};
      validate(value, rule)[0].message.should.equal('string should match /\\d+/');
    });
  });

  describe('id', function () {
    it('should check ok', function () {
      var value = {id : '0524' };
      var rule = {id: 'id'};
      should.not.exist(validate(value, rule));
    });

    it('should check id not ok', function () {
      var value = {id : '0524x' };
      var rule = {id: 'id'};
      validate(value, rule)[0].message.should.equal('id should match /^\\d+$/');
    });
  });


  describe('date', function () {
    it('should check ok', function () {
      var value = {date : '2014-11-11' };
      var rule = {date: 'date'};
      should.not.exist(validate(value, rule));
    });

    it('should check date not ok', function () {
      var value = {date : '2014-xx-xx' };
      var rule = {date: 'date'};
      validate(value, rule)[0].message.should.equal('date should match /^\\d{4}\\-\\d{2}\\-\\d{2}$/');
    });
  });

  describe('dateTime', function () {
    it('should check ok', function () {
      var value = {dateTime : '2014-11-11 00:00:00' };
      var rule = {dateTime: 'dateTime'};
      should.not.exist(validate(value, rule));
    });

    it('should check dateTime not ok', function () {
      var value = {dateTime : '2014-11-11 00:xx:00' };
      var rule = {dateTime: 'dateTime'};
      validate(value, rule)[0].message.should.equal('dateTime should match /^\\d{4}\\-\\d{2}\\-\\d{2} \\d{2}:\\d{2}:\\d{2}$/');
    });
  });

  describe('boolean', function () {
    it('should check ok', function () {
      var value = {boolean : true };
      var rule = {boolean: 'boolean'};
      should.not.exist(validate(value, rule));
      rule = {boolean: 'bool'};
      should.not.exist(validate(value, rule));
    });

    it('should check boolean not ok', function () {
      var value = {boolean : '2014-11-11 00:xx:00' };
      var rule = {boolean: 'boolean'};
      validate(value, rule)[0].message.should.equal('boolean should be a boolean');
    });
  });

  describe('enum', function () {
    it('should check ok', function () {
      var value = {enum : 1 };
      var rule = {enum: [1, 2, 3]};
      should.not.exist(validate(value, rule));
      rule = {enum: {type: 'enum', values: [1, 2, 3]}};
      should.not.exist(validate(value, rule));
    });

    it('should throw when no values', function () {
      (function () {
        validate({enum: 1}, {enum: {type: 'enum'}});
      }).should.throw('check enum need array type values');
    });

    it('should check enum not ok', function () {
      var value = {enum : 4 };
      var rule = {enum: [1, 2, 3]};
      validate(value, rule)[0].message.should.equal('enum should be one of 1, 2, 3');
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
      should.not.exist(validate(value, rule));
      should.not.exist(validate(value, {object: 'object'}));
    });

    it('should check object', function () {
      var value = {object: 1};
      var rule = {object: 'object'};
      validate(value, rule)[0].message.should.equal('object should be an object');
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
      validate(value, rule)[0].message.should.equal('object.age should be an integer');
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
          rule: {
            name: 'string',
            age: 'int'
          }
        }
      };
      should.not.exist(validate(value, rule));
      should.not.exist(validate(value, {array: 'array'}));
    });

    it('should check array', function () {
      var value = {array: 1};
      var rule = {array: 'array'};
      validate(value, rule)[0].message.should.equal('array should be an array');
    });

    it('should check error', function () {
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
          rule: {
            name: 'string',
            age: 'int'
          }
        }
      };
      validate(value, rule)[0].message.should.equal('array[0].name should be a string');
      validate(value, rule)[1].message.should.equal('array[1].age should be an integer');
    });
  });
});
