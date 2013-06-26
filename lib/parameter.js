/*!
 * parameter - lib/parameter.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var DATE_TYPE_RE = /^\d{4}\-\d{2}\-\d{2}$/;
var DATETIME_TYPE_RE = /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/;
var ID_RE = /^\d+$/;

exports.Date = function (value, valueType) {
  if (valueType !== 'string' || !DATE_TYPE_RE.test(value)) {
    return 'should be "YYYY-MM-DD" date format string';
  }
};

exports.DateTime = function (value, valueType) {
  if (valueType !== 'string' || !DATETIME_TYPE_RE.test(value)) {
    return 'should be "YYYY-MM-DD hh:mm:ss" date format string';
  }
};

exports.Id = function (value, valueType) {
  if (valueType !== 'string' || !ID_RE.test(value)) {
    return 'should be digital string';
  }
};

function checkType(valueType, expectType) {
  if (valueType !== expectType) {
    return 'expect ' + expectType + ', but got ' + valueType;
  }
}

var TYPES = {

};

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
exports.verify = function (data, rules, resourceName) {
  resourceName = resourceName || 'Param';
  var errors = [];
  for (var key in rules) {
    var value = data[key];
    var rule = rules[key];
    if (!rule) {
      continue;
    }

    // check exist
    var required = rule.required !== false;
    if (value === undefined || value === null) {
      if (required) {
        errors.push({
          resource: resourceName,
          field: key,
          message: key + ' required',
          code: 'missing_field'
        });
      }
      continue;
    }

    
    var valueType = typeof value;
    var ruleType = typeof rule;
    var checkFunction;
    var errorMsg;

    if (ruleType === 'string') {
      // key: 'number'
      value = valueType;
      valueType = rule;
      checkFunction = checkType;
    } else if (ruleType === 'function') {
      // key: function () {}
      checkFunction = rule;
    } else {
      if (rule.type) {
        ruleType = typeof rule.type;
        if (ruleType === 'string') {
          // key: { type: 'string' }
          value = valueType;
          valueType = rule.type;
        } else if (ruleType === 'function') {
          // key: { type: function () {} }
          checkFunction = checkType;
        }
      } else if (rule.isDate) {
        // key: { isDate: true }
        checkFunction = exports.Date;
      } else if (rule.isId ) {
        // key: { isId: true }
        checkFunction = exports.Id;
      } else if (rule.isDateTime ) {
        // key: { isDateTime: true }
        checkFunction = exports.DateTime;
      }
    }

    if (checkFunction) {
      errorMsg = checkFunction(value, valueType);
      if (errorMsg) {
        errors.push({
          resource: resourceName,
          field: key,
          message: errorMsg,
          code: 'invalid'
        });
      }
    }

  }

  return errors.length ? errors : null;
};
