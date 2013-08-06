/*!
 * parameter - test/parameter.test.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var p = require('../');
var should = require('should');

describe('parameter.test.js', function () {
  
  describe('verify()', function () {
    
    it('should all pass', function () {
      var data = {
        id: '043624',
        nick: '苏千',
        date: '2013-06-25',
        age: 29,
        time: '2013-06-26 12:20:50',
        sid: '123',
        uid: 456,
      };

      var rules = {
        id: p.Id,
        nick: 'string',
        date: p.Date,
        age: 'number',
        sex: { required: false, type: 'string' },
        emptyRule: null,
        time: { required: false, type: p.DateTime },
        sid: /^\d+$/,
        uid: { type: /^\d+$/ }
      };
      should.not.exists(p.verify(data, rules));
      // run again to vaild cache functions
      should.not.exists(p.verify(data, rules));
      should.not.exists(p.verify(data, rules));
      should.not.exists(p.verify(data, rules));
      should.not.exists(p.verify(data, rules));
      should.not.exists(p.verify(data, rules));
    });

    it('should be string and not empty', function () {
      should.not.exists(p.verify({key: 'foo'}, {key: 'string'}));
      should.not.exists(p.verify({key: 'foo'}, {key: {type: 'string'}}));
      should.not.exists(p.verify({key: ''}, {key: {type: 'string', empty: true}}));

      should.exists(p.verify({key: ''}, {key: 'string'}));
      should.exists(p.verify({key: '     \r\n   \t  '}, {key: 'string'}));
      should.exists(p.verify({key: ''}, {key: {type: 'string', empty: false}}));
      p.verify({key: ''}, {key: 'string'})[0].message.should.equal('should not be empty string');
    });

    it('should match regex', function () {
      should.not.exists(p.verify({key: 123}, {key: /^\d+$/}));
      should.not.exists(p.verify({key: '123'}, {key: {type: /^\d+$/}}));
      should.not.exists(p.verify({}, {key: {type: /^\d+$/, required: false}}));

      should.exists(p.verify({key: null}, {key: /^\d+$/}));
      should.exists(p.verify({key: '123foo'}, {key: /^\d+$/}));
      should.exists(p.verify({key: ''}, {key: {type: '/^\d+$/'}}));
      p.verify({key: 0.33}, {key: /^\d+$/})[0].message.should.equal('should match /^\\\d+$/');
    });

    it('should verify array', function () {
      should.not.exists(p.verify({key: 'foo', a: []}, {key: 'string', a: p.Array}));
      should.not.exists(p.verify({key: 'foo', a: []}, {key: 'string', a: {isArray: true}}));
      should.not.exists(p.verify(
        {key: 'foo', a: [{name: 'bar', age: 11}]}, 
        {key: 'string', a: {isArray: true, rules: {name: 'string', age: 'number'}}}
      ));

      should.exists(p.verify({key: 'foo', a: {}}, {key: 'string', a: p.Array}));
      should.exists(p.verify({key: 'foo', a: 1}, {key: 'string', a: {isArray: true}}));
      p.verify({key: 'foo', a: {}}, {key: 'string', a: p.Array}).should.eql([
        {resource: 'Param', field: 'a', message: 'should be an array', code: 'invalid'}
      ]);

      var errs1 = p.verify(
        {key: 'foo', a: [{name: '   ', age: '11'}, {name: '   ', age: []}]}, 
        {key: 'string', a: {isArray: true, resource: 'User', rules: {name: 'string', age: 'number'}}}
      );
      errs1.should.eql([
        {resource: 'User', field: 'name', message: 'should not be empty string', code: 'invalid'},
        {resource: 'User', field: 'age', message: 'expect number, but got string', code: 'invalid'},
      ]);
      var errs2 = p.verify(
        {key: '', a: [{name: '   ', age: '11'}, {name: '   ', age: []}]}, 
        {key: 'string', a: {isArray: true, resource: 'User', rules: {name: 'string', age: 'number'}}}
      );
      errs2.should.eql([
        {resource: 'Param', field: 'key', message: 'should not be empty string', code: 'invalid'},
      ]);
    });

    it('should verify object', function () {
      should.not.exists(p.verify({key: 'foo', a: {}}, {key: 'string', a: p.Object}));
      should.not.exists(p.verify({key: 'foo', a: {}}, {key: 'string', a: {isObject: true}}));
      should.not.exists(p.verify(
        {key: 'foo', a: {name: 'bar', age: 11}}, 
        {key: 'string', a: {isObject: true, rules: {name: 'string', age: 'number'}}}
      ));

      should.exists(p.verify({key: 'foo', a: []}, {key: 'string', a: p.Object}));
      should.exists(p.verify({key: 'foo', a: 1}, {key: 'string', a: {isObject: true}}));
      p.verify({key: 'foo', a: []}, {key: 'string', a: p.Object}).should.eql([
        {resource: 'Param', field: 'a', message: 'should be an object', code: 'invalid'}
      ]);

      var errs1 = p.verify(
        {key: 'foo', a: {name: '   ', age: '11'}}, 
        {key: 'string', a: {isObject: true, resource: 'User', rules: {name: 'string', age: 'number'}}}
      );
      errs1.should.eql([
        {resource: 'User', field: 'name', message: 'should not be empty string', code: 'invalid'},
        {resource: 'User', field: 'age', message: 'expect number, but got string', code: 'invalid'},
      ]);
      var errs2 = p.verify(
        {key: '', a: {name: '   ', age: '11'}}, 
        {key: 'string', a: {isObject: true, resource: 'User', rules: {name: 'string', age: 'number'}}}
      );
      errs2.should.eql([
        {resource: 'Param', field: 'key', message: 'should not be empty string', code: 'invalid'},
      ]);
    });

    it('should cache function work for required = false', function () {
      var rules = {key: {required: false, type: 'number'}};
      should.not.exists(p.verify({key: 1}, rules));
      should.not.exists(p.verify({key2: 1}, rules));
      should.not.exists(p.verify({key: 1}, rules));
      should.not.exists(p.verify({}, rules));
    });

    it('should errors', function () {
      var wrongData = {
        nick: 123,
        date: '2013-06-1',
        age: '29',
        sex: 0,
        no: 123,
        time: '2013-06-01 11:11:100'
      };

      var rules = {
        id: p.Id,
        nick: 'string',
        date: p.Date,
        age: 'number',
        sex: { required: false, type: 'string' },
        no: p.Id,
        emptyRule: null,
        time: { required: false, type: p.DateTime },
      };
      var errors = p.verify(wrongData, rules);
      errors.should.eql([ 
        { resource: 'Param',
          field: 'id',
          message: 'id required',
          code: 'missing_field' },
        { resource: 'Param',
          field: 'nick',
          message: 'expect string, but got number',
          code: 'invalid' },
        { resource: 'Param',
          field: 'date',
          message: 'should be "YYYY-MM-DD" date format string',
          code: 'invalid' },
        { resource: 'Param',
          field: 'age',
          message: 'expect number, but got string',
          code: 'invalid' },
        { resource: 'Param',
          field: 'sex',
          message: 'expect string, but got number',
          code: 'invalid' },
        { resource: 'Param',
          field: 'no',
          message: 'should be digital string',
          code: 'invalid' },
        { resource: 'Param',
          field: 'time',
          message: 'should be \"YYYY-MM-DD hh:mm:ss\" date format string',
          code: 'invalid' },
      ]);
      should.exists(p.verify(wrongData, rules));
      should.exists(p.verify(wrongData, rules));
      should.exists(p.verify(wrongData, rules));
    });

    it('should check exists, {required: false|true}', function () {
      should.not.exists(p.verify({key: 1}, {key: 'number'}));
      should.not.exists(p.verify({key: 1}, {key: {required: true}}));
      should.not.exists(p.verify({key2: 1}, {key: {required: false}}));
      should.not.exists(p.verify({key: 1}, {key: {}}));
      should.not.exists(p.verify({key: 1}, {key2: {type: 'number', required: false}}));
      should.not.exists(p.verify({}, {key2: {type: 'number', required: false}}));

      should.exists(p.verify({key2: 1}, {key: {required: true}}));
      should.exists(p.verify({key2: 1}, {key: {}}));
      p.verify({}, {key: 'number'}).should.eql([ { resource: 'Param',
        field: 'key',
        message: 'key required',
        code: 'missing_field' } 
      ]);
    });

    it('should check type, rules: {key: "number|string|function|object"} or {key: {type: "type"}}', function () {
      should.not.exists(p.verify({key: 1}, {key: 'number'}));
      should.not.exists(p.verify({key: 1}, {key: {type: 'number'}}));
      should.not.exists(p.verify({key: 'p'}, {key: 'string'}));
      should.not.exists(p.verify({key: 'foo'}, {key: 'string'}));
      should.not.exists(p.verify({key: 'foo'}, {key: {type: 'string'}}));
      should.not.exists(p.verify({key: function () {}}, {key: 'function'}));
      should.not.exists(p.verify({key: function () {}}, {key: {type:'function'}}));
      should.not.exists(p.verify({key: {}}, {key: 'object'}));
      should.not.exists(p.verify({key: {}}, {key: {type:'object'}}));

      should.exists(p.verify({key: '1'}, {key: 'number'}));
      should.exists(p.verify({key: '1'}, {key: {type: 'number'}}));
      should.exists(p.verify({key: 1}, {key: 'string'}));
      should.exists(p.verify({key: 1}, {key: {type: 'string'}}));
      should.exists(p.verify({key: {}}, {key: 'function'}));
      should.exists(p.verify({key: {}}, {key: {type:'function'}}));
      should.exists(p.verify({key: 1}, {key: 'object'}));
      should.exists(p.verify({key: 1}, {key: {type:'object'}}));
    });

    it('should check with function, {key: fn} or {key: {type: fn}}', function () {
      should.not.exists(p.verify({key: '2013-05-01'}, {key: p.Date}));
      should.not.exists(p.verify({key: '2013-05-01'}, {key: {type: p.Date}}));
      should.not.exists(p.verify({key: '2013-05-01 01:01:01'}, {key: p.DateTime}));
      should.not.exists(p.verify({key: '2013-05-01 01:01:01'}, {key: {type: p.DateTime}}));
      should.not.exists(p.verify({key: '2013'}, {key: p.Id}));
      should.not.exists(p.verify({key: '2013'}, {key: {type: p.Id}}));
      should.not.exists(p.verify({key: '2013'}, {key: function () {}}));
      should.not.exists(p.verify({key: '2013'}, {key: {type: function () {}}}));

      should.exists(p.verify({key: '2013-05-012'}, {key: p.Date}));
      should.exists(p.verify({key: '2013-05-012'}, {key: {type: p.Date}}));
      should.exists(p.verify({key: '2013-05-01 1:01:01'}, {key: p.DateTime}));
      should.exists(p.verify({key: '2013-05-01 1:01:01'}, {key: {type: p.DateTime}}));
      should.exists(p.verify({key: 2013}, {key: p.Id}));
      should.exists(p.verify({key: '2013a'}, {key: p.Id}));
      should.exists(p.verify({key: '2013a'}, {key: {type: p.Id}}));
      should.exists(p.verify({key: '2013'}, {key: function () { return 'error'; }}));
      should.exists(p.verify({key: '2013'}, {key: {type: function () { return 'error'; }}}));
    });

    it('should check with isDate: true, isId: true or isDateTime: true', function () {
      should.not.exists(p.verify({key: '2013-05-01'}, {key: {isDate: true}}));
      should.not.exists(p.verify({key: '2013-05-01 01:01:01'}, {key: {isDateTime: true}}));
      should.not.exists(p.verify({key: '2013'}, {key: {isId: true}}));

      should.exists(p.verify({key: '2013-05-1'}, {key: {isDate: true}}));
      should.exists(p.verify({key: '2013-05-1 01:01:01'}, {key: {isDateTime: true}}));
      should.exists(p.verify({key: '2013a'}, {key: {isId: true}}));
      should.exists(p.verify({key: 2013}, {key: {isId: true}}));
    });

  });

});
 