/**
 * parameter - index.js
 *
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *  fengmk2 <fengmk2@gmail.com>
 *  dead_horse <dead_horse@qq.com>
 */

'use strict';

/**
 * Regexps
 */

var DATE_TYPE_RE = /^\d{4}\-\d{2}\-\d{2}$/;
var DATETIME_TYPE_RE = /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/;
var ID_RE = /^\d+$/;

/**
 * Simple type map
 */

var TYPE_MAP = {
  number: checkNumber,
  int: checkInt,
  integer: checkInt,
  string: checkString,
  id: checkId,
  date: checkDate,
  dateTime: checkDateTime,
  boolean: checkBoolean,
  bool: checkBoolean,
  array: checkArray,
  object: checkObject,
  enum: checkEnum
};

var TYPES = Object.keys(TYPE_MAP);

module.exports = check;

/**
 * [check description]
 * @return {[type]} [description]
 */

function check(obj, rules) {
  if (typeof rules !== 'object') {
    throw new TypeError('need object type rule');
  }

  var errors = [];

  for (var key in rules) {
    var rule = getRule(rules[key]);
    var has = obj.hasOwnProperty(key);
    var data = obj[key];
    if (!has) {
      if (rule.required !== false) {
        errors.push({
          message: key + ' required',
          field: key,
          code: 'missing_field'
        });
      }
      continue;
    }

    var checker = TYPE_MAP[rule.type];
    if (!checker) {
      throw new Error('rule type must be one of ' + TYPES.join(', '));
    }

    var msg = checker(data, rule);
    if (typeof msg === 'string') {
      errors.push({
        message: key + ' ' + msg,
        code: 'invalid',
        field: key
      });
    }

    if (Array.isArray(msg)) {
      msg.forEach(function (e) {
        var dot = rule.type === 'object' ? '.' : '';
        e.message = key + dot + e.field;
        e.field = key + dot + e.field;
        errors.push(e);
      });
    }
  }

  if (errors.length) {
    return errors;
  }
}

function getRule(rule) {
  if (typeof rule === 'string') {
    return { type: rule };
  }
  if (Array.isArray(rule)) {
    return { type: 'enum', values: rule };
  }
  if (rule instanceof RegExp) {
    return { type: 'string', format: rule };
  }
  return rule;
}

/**
 * check value if is an integer
 *
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkInt(value, rule) {
  if (typeof value !== 'number' && value % 1 === 0) {
    return 'should be an integer';
  }

  if (rule.max && value > rule.max) {
    return 'should smaller than ' + rule.max;
  }

  if (rule.min && value < rule.min) {
    return 'should bigger than ' + rule.min;
  }
}

/**
 * check value if is a number
 *
 * @param {Object} argument
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */
function checkNumber(value, rule) {
  if (typeof value !== 'number') {
    return 'should be a number';
  }
  if (rule.max && value > rule.max) {
    return 'should smaller than ' + rule.max;
  }
  if (rule.min && value < rule.min) {
    return 'should bigger than ' + rule.min;
  }
}

function checkString(value, rule) {
  if (typeof value !== 'string') {
    return 'should be a string';
  }
  if (!rule.empty && value === '') {
    return 'should not be empty';
  }
  if (rule.format && !value.match(rule.format)) {
    return 'should match ' + rule.format;
  }
}

function checkId(value, rule) {
  return checkString(value, {format: ID_RE});
}

function checkDate(value, rule) {
  return checkString(value, {format: DATE_TYPE_RE});
}

function checkDateTime(value, rule) {
  return checkString(value, {format: DATETIME_TYPE_RE});
}

function checkBoolean(value) {
  if (typeof value !== 'boolean') {
    return 'should be a boolean';
  }
}

function checkEnum(value, rule) {
  if (!Array.isArray(rule.values)) {
    throw new TypeError('check enum need array type values');
  }
  if (rule.values.indexOf(value) === -1) {
    return 'should be one of ' + rule.values.join(', ');
  }
}

function checkObject (value, rule) {
  if (typeof value !== 'object') {
    return 'should be an object';
  }

  if (rule.rule) {
    return check(value, rule.rule);
  }
}

function checkArray (value, rule) {
  if (!Array.isArray(value)) {
    return 'should be an array';
  }

  if (rule.rule) {
    var errors = [];
    value.forEach(function (v, i) {
      var errs = check(v, rule.rule);
      if (!errs) {
        return;
      }

      errors = errors.concat(errs.map(function (e) {
        e.field = '[' + i + '].' + e.field;
        e.message = '[' + i + '].' + e.field;
        return e;
      }));
    });
    return errors;
  }
}
