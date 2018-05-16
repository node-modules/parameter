'use strict';

var util = require('util');
var helper = require('./lib/helper');

var TYPE_MAP = helper.TYPE_MAP;
var formatRule = helper.formatRule;
var formatError = helper.formatError;
var checkString = helper.checkString;

/**
 * Parameter class
 * @class Parameter
 */
class Parameter {
  constructor(opts) {
    opts = opts || {};

    if (typeof opts.translate === 'function') {
      this.translate = opts.translate;
    }

    this.TYPE_MAP = TYPE_MAP;
  }

  t() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof this.translate === 'function') {
      return this.translate.apply(this, args);
    } else {
      return util.format.apply(util, args);
    }
  }

  /**
   * validate
   *
   * @param {Object} rules
   * @return {Object} obj
   * @api public
   */
  validate(rules, obj) {
    if (typeof rules !== 'object') {
      throw new TypeError('need object type rule');
    }

    var self = this;

    var errors = [];

    for (var key in rules) {
      var rule = formatRule(rules[key]);
      var has = obj.hasOwnProperty(key);
      if (!has) {
        if (rule.required !== false) {
          var err = formatError(this.t('missing_field'), key, this.t('required'), rule.customMsg);
          errors.push(err);
        }
        continue;
      }

      var checker = TYPE_MAP[rule.type];
      if (!checker) {
        throw new TypeError('rule type must be one of ' + Object.keys(TYPE_MAP).join(', ') +
          ', but the following type was passed: ' + rule.type);
      }

      var msg = checker.call(self, rule, obj[key], obj);
      if (typeof msg === 'string') {
        var err = formatError(this.t('invalid'), key, msg, rule.customMsg);
        errors.push(err);
        continue;
      }

      if (Array.isArray(msg)) {
        msg.forEach(function (e) {
          var dot = rule.type === 'object' ? '.' : '';
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

  addRule(type, check) {
    if (!type) {
      throw new TypeError('`type` required');
    }

    if (typeof check === 'function') {
      TYPE_MAP[type] = check;
      return;
    }

    if (check instanceof RegExp) {
      TYPE_MAP[type] = function (rule, value) {
        return checkString.call(this, {format: check}, value);
      };
      return;
    }

    throw new TypeError('check must be function or regexp');
  }
};

/**
 * Module exports
 * @type {Function}
 */
module.exports = Parameter;
