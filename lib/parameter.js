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

exports.Array = function (value) {
  if (!Array.isArray(value)) {
    return 'should be an array';
  }
};

exports.Object = function (value, valueType) {
  if (valueType !== 'object' || Array.isArray(value)) {
    return 'should be an object';
  }
};

function checkType(value, valueType, expectType, allowEmpty) {
  if (valueType !== expectType) {
    return 'expect ' + expectType + ', but got ' + valueType;
  } else if (!allowEmpty && expectType === 'string' && value.trim().length === 0) {
    return 'should not be empty ' + expectType;
  }
}

function noop() {}

function createRegExpFunction(re) {
  return function regexpCheck(value) {
    return !re.test(value) ? ('should match ' + re) : undefined;
  };
}

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
exports.verify = function (data, rules, resourceName) {
  resourceName = resourceName || 'Param';
  var errors = [];
  for (var key in rules) {
    var value = data[key];
    var rule = rules[key];
    if (!rule) {
      continue;
    }

    // check exists
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

    // cache for performance
    var expectType = rule.__expectType;
    var empty = rule.__empty || false;
    var checkFunction = rule.__checkFunction;
    var childRules = rule.rules;
    var childResourceName = rule.resource;
    var errorMsg = null;

    if (!checkFunction) {
      var ruleType = typeof rule;
      if (ruleType === 'string') {
        // key: 'number'
        expectType = rule;
        empty = false;
        checkFunction = checkType;
      } else if (ruleType === 'function') {
        // key: function () {}
        checkFunction = rule;
      } else if (rule instanceof RegExp) {
        // key: /\d+/
        checkFunction = createRegExpFunction(rule);
      } else {
        empty = rule.empty;
        if (rule.type) {
          ruleType = typeof rule.type;
          if (ruleType === 'string') {
            // key: { type: 'string' }
            expectType = rule.type;
            checkFunction = checkType;
          } else if (ruleType === 'function') {
            // key: { type: function () {} }
            checkFunction = rule.type;
          } else if (rule.type instanceof RegExp) {
            // key: { type: /\d+/ }
            checkFunction = createRegExpFunction(rule.type);
          }
        } else if (rule.isDate) {
          // key: { isDate: true }
          checkFunction = exports.Date;
        } else if (rule.isId) {
          // key: { isId: true }
          checkFunction = exports.Id;
        } else if (rule.isDateTime) {
          // key: { isDateTime: true }
          checkFunction = exports.DateTime;
        } else if (rule.isArray) {
          // key: {isArray: true}
          checkFunction = exports.Array;
        } else if (rule.isObject) {
          // key: {isObject: true}
          checkFunction = exports.Object;
        }
      }

      if (!checkFunction) {
        checkFunction = noop;
      }

      rules[key] = {
        required: required,
        __checkFunction: checkFunction,
        __expectType: expectType,
        __oldRule: rule,
        __empty: empty,
        __childRules: childRules,
        __childResourceName: childResourceName,
      };
    }

    errorMsg = checkFunction(value, valueType, expectType, empty);
    if (errorMsg) {
      errors.push({
        resource: resourceName,
        field: key,
        message: errorMsg,
        code: 'invalid'
      });
    }

    if (!errors.length) {
      if (childRules) {
        var errs;
        if (checkFunction === exports.Array) {
          for (var i = 0; i < value.length; i++) {
            var item = value[i];
            errs = exports.verify(item, childRules, childResourceName);
            if (errs) {
              errors = errors.concat(errs);
              break;
            }
          }
        } else if (checkFunction === exports.Object) {
          errs = exports.verify(value, childRules, childResourceName);
          if (errs) {
            errors = errors.concat(errs);
          }
        }
      }
    }

  }

  return errors.length ? errors : null;
};
