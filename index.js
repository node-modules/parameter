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
 * Module exports
 * @type {Function}
 */

module.exports = validate;

/**
 * Regexps
 */

var DATE_TYPE_RE = /^\d{4}\-\d{2}\-\d{2}$/;
var DATETIME_TYPE_RE = /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/;
var ID_RE = /^\d+$/;

/**
 * Simple type map
 * @type {Object}
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

/**
 * All support types
 * @type {Array}
 */

var TYPES = Object.keys(TYPE_MAP);

/**
 * check
 * @return {[type]} [description]
 */

function validate(obj, rules) {
  if (typeof rules !== 'object') {
    throw new TypeError('need object type rule');
  }

  var errors = [];

  for (var key in rules) {
    var rule = formatRule(rules[key]);
    var has = obj.hasOwnProperty(key);

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
      throw new TypeError('rule type must be one of ' + TYPES.join(', ') +
        ', but the following type was passed: ' + rule.type);
    }

    var msg = checker(obj[key], rule);
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
        e.message = key + dot + e.message;
        e.field = key + dot + e.field;
        errors.push(e);
      });
    }
  }

  if (errors.length) {
    return errors;
  }
}

/**
 * format a rule
 *
 * @param {Mixed} rule
 * @return {Object}
 * @api private
 */

function formatRule(rule) {
  if (typeof rule === 'string') {
    return { type: rule };
  }
  if (Array.isArray(rule)) {
    return { type: 'enum', values: rule };
  }
  if (rule instanceof RegExp) {
    return { type: 'string', format: rule };
  }
  return rule || {};
}

/**
 * check interger
 * {
 *   max: 100,
 *   min: 0
 * }
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkInt(value, rule) {
  if (typeof value !== 'number' || value % 1 !== 0) {
    return 'should be an integer';
  }

  if (rule.hasOwnProperty('max') && value > rule.max) {
    return 'should smaller than ' + rule.max;
  }

  if (rule.hasOwnProperty('min') && value < rule.min) {
    return 'should bigger than ' + rule.min;
  }
}

/**
 * check number
 * {
 *   max: 100,
 *   min: 0
 * }
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */
function checkNumber(value, rule) {
  if (typeof value !== 'number') {
    return 'should be a number';
  }
  if (rule.hasOwnProperty('max') && value > rule.max) {
    return 'should smaller than ' + rule.max;
  }
  if (rule.hasOwnProperty('min') && value < rule.min) {
    return 'should bigger than ' + rule.min;
  }
}

/**
 * check string
 * {
 *   allowEmpty: true, // (default to false, alias to empty)
 *   format: /^\d+$/,
 *   max: 100,
 *   min: 0
 * }
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkString(value, rule) {
  if (typeof value !== 'string') {
    return 'should be a string';
  }
  var allowEmpty = rule.hasOwnProperty('allowEmpty')
    ? rule.allowEmpty
    : rule.empty;

  if (rule.hasOwnProperty('max') && value.length > rule.max) {
    return 'length should smaller than ' + rule.max;
  }
  if (rule.hasOwnProperty('min') && value.length < rule.min) {
    return 'length should bigger than ' + rule.min;
  }

  if (!allowEmpty && value === '') {
    return 'should not be empty';
  }
  if (rule.format && !rule.format.test(value)) {
    return 'should match ' + rule.format;
  }
}

/**
 * check id format
 * format: /^\d+/
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkId(value, rule) {
  return checkString(value, {format: ID_RE});
}

/**
 * check date format
 * format: YYYY-MM-DD
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkDate(value, rule) {
  return checkString(value, {format: DATE_TYPE_RE});
}

/**
 * check date time format
 * format: YYYY-MM-DD HH:mm:ss
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkDateTime(value, rule) {
  return checkString(value, {format: DATETIME_TYPE_RE});
}

/**
 * check boolean
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkBoolean(value) {
  if (typeof value !== 'boolean') {
    return 'should be a boolean';
  }
}

/**
 * check enum
 * {
 *   values: [0, 1, 2]
 * }
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkEnum(value, rule) {
  if (!Array.isArray(rule.values)) {
    throw new TypeError('check enum need array type values');
  }
  if (rule.values.indexOf(value) === -1) {
    return 'should be one of ' + rule.values.join(', ');
  }
}

/**
 * check object
 * {
 *   rule: {}
 * }
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkObject (value, rule) {
  if (typeof value !== 'object') {
    return 'should be an object';
  }

  if (rule.rule) {
    return validate(value, rule.rule);
  }
}

/**
 * check array
 * {
 *   type: 'array',
 *   itemType: 'string'
 *   rule: {type: 'string', allowEmpty: true}
 * }
 *
 * {
 *   type: 'array'.
 *   itemType: 'object',
 *   rule: {
 *     name: 'string'
 *   }
 * }
 *
 * @param {Mixed} value
 * @param {Object} rule
 * @return {Boolean}
 * @api private
 */

function checkArray (value, rule) {
  if (!Array.isArray(value)) {
    return 'should be an array';
  }

  if (!rule.itemType) {
    return;
  }

  var checker = TYPE_MAP[rule.itemType];
  if (!checker) {
    throw new TypeError('rule type must be one of ' + TYPES.join(', ') +
        ', but the following type was passed: ' + rule.itemType);
  }

  var errors = [];
  var subRule = rule.itemType === 'object'
  ? rule
  : rule.rule || formatRule(rule.itemType);

  value.forEach(function (v, i) {
    var index = '[' + i + ']';
    var errs = checker(v, subRule);

    if (typeof errs === 'string') {
      errors.push({
        field: index,
        message: index + ' ' + errs,
        code: 'invalid'
      });
    }
    if (Array.isArray(errs)) {
      errors = errors.concat(errs.map(function (e) {
        e.field = index + '.' + e.field;
        e.message = index + '.' + e.message;
        return e;
      }));
    }
  });

  return errors;
}
