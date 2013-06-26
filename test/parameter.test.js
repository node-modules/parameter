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
      should.not.exists(errors);
    });

    it('should errors', function () {
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
      var errors = p.verify(wrongData, rules);
      should.not.exists(errors);
    });

  });

});