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
validate.addRule = addRule;

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

var TYPE_MAP = validate.TYPE_MAP = {
  number: checkNumber,
  int: checkInt,
  integer: checkInt,
  string: checkString,
  id: checkId,
  date: checkDate,
  dateTime: checkDateTime,
  datetime: checkDateTime,
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
 * validate
 *
 * @param {Object} rules
 * @return {Object} obj
 * @api public
 */

function validate(rules, obj) {
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

    var msg = checker(rule, obj[key]);
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
 * add custom rule
 *
 * @param {String} type
 * @param {Function | RegExp} check
 * @api public
 */

function addRule(type, check) {
  if (!type) {
    throw new TypeError('`type` required');
  }

  if (typeof check === 'function') {
    TYPE_MAP[type] = check;
    return;
  }

  if (check instanceof RegExp) {
    TYPE_MAP[type] = function (rule, value) {
      return checkString({format: check}, value);
    };
    return;
  }

  throw new TypeError('check must be function or regexp');
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
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkInt(rule, value) {
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
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkNumber(rule, value) {
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
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkString(rule, value) {
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
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkId(rule, value) {
  return checkString({format: ID_RE}, value);
}

/**
 * check date format
 * format: YYYY-MM-DD
 *
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkDate(rule, value) {
  return checkString({format: DATE_TYPE_RE}, value);
}

/**
 * check date time format
 * format: YYYY-MM-DD HH:mm:ss
 *
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkDateTime(rule, value) {
  return checkString({format: DATETIME_TYPE_RE}, value);
}

/**
 * check boolean
 *
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkBoolean(rule, value) {
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
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkEnum(rule, value) {
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
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkObject(rule, value) {
  if (typeof value !== 'object') {
    return 'should be an object';
  }

  if (rule.rule) {
    return validate(rule.rule, value);
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
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkArray(rule, value) {
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
    var errs = checker(subRule, v);

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
