'use strict';

var util = require('util');

/**
 * Regexps
 */

var DATE_TYPE_RE = /^\d{4}\-\d{2}\-\d{2}$/;
var DATETIME_TYPE_RE = /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/;
var ID_RE = /^\d+$/;

// http://www.regular-expressions.info/email.html
var EMAIL_RE = /^[a-z0-9\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+(?:\.[a-z0-9\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$/i;

var PASSWORD_RE = /^[\w\`\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\]\{\}\|\;\:\'\"\,\<\.\>\/\?]+$/;

// https://gist.github.com/dperini/729294
var URL_RE = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;

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

    if (opts.validateRoot) this.validateRoot = true;
    if (opts.convert) this.convert = true;
    if (opts.widelyUndefined) this.widelyUndefined = true;
  }

  t() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof this.translate === 'function') {
      return this.translate.apply(this, args);
    } else {
      return util.format.apply(util, args);
    }
  }

  message(rule, key, defaultMessage) {
    return rule.message && rule.message[key] || defaultMessage;
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

    if (this.validateRoot && (typeof obj !== 'object' || !obj)) {
      return [{
        message: this.t('the validated value should be a object'),
        code: this.t('invalid'),
        field: undefined,
      }];
    }

    var self = this;

    var errors = [];

    for (var key in rules) {
      var rule = formatRule(rules[key]);
      var value = obj[key];

      if (typeof value === 'string' && rule.trim === true) {
        value = obj[key] = value.trim();
      }

      // treat null / '' / NaN as undefined
      let widelyUndefined = this.widelyUndefined;
      if ('widelyUndefined' in rule) widelyUndefined = rule.widelyUndefined;
      if (widelyUndefined &&
        (value === '' || value === null || Number.isNaN(value))) {
        value = obj[key] = undefined;
      }

      var has = value !== null && value !== undefined;

      if (!has) {
        if (rule.required !== false) {
          errors.push({
            message: this.message(rule, 'required', this.t('required')),
            field: key,
            code: this.t('missing_field')
          });
        }
        // support default value
        if ('default' in rule) {
          obj[key] = rule.default;
        }
        continue;
      }

      var checker = TYPE_MAP[rule.type];
      if (!checker) {
        throw new TypeError('rule type must be one of ' + Object.keys(TYPE_MAP).join(', ') +
          ', but the following type was passed: ' + rule.type);
      }

      convert(rule, obj, key, this.convert);
      var msg = checker.call(self, rule, obj[key], obj);
      if (typeof msg === 'string') {
        errors.push({
          message: msg,
          code: this.t('invalid'),
          field: key
        });
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
};

/**
 * Module exports
 * @type {Function}
 */
module.exports = Parameter;

/**
 * add custom rule to global rules list.
 *
 * @param {String} type
 * @param {Function | RegExp} check
 * @param {Boolean} [override] - override exists rule or not, default is true
 * @param {String|Function} [convertType]
 * @api public
 */
Parameter.prototype.addRule = Parameter.addRule = function addRule(type, check, override, convertType) {
  if (!type) {
    throw new TypeError('`type` required');
  }

  // addRule(type, check, convertType)
  if (typeof override === 'string' || typeof override === 'function') {
    convertType = override;
    override = true;
  }

  if (typeof override !== 'boolean') {
    override = true;
  }

  if (!override && TYPE_MAP[type]) {
    throw new TypeError('rule `' + type + '` exists');
  }

  if (convertType) {
    if (typeof convertType !== 'string' && typeof convertType !== 'function') {
      throw new TypeError('convertType should be string or function');
    }
    Parameter.CONVERT_MAP[type] = convertType;
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
};

/**
 * Simple type map
 * @type {Object}
 */
var TYPE_MAP = Parameter.TYPE_MAP = {
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
  enum: checkEnum,
  email: checkEmail,
  password: checkPassword,
  url: checkUrl,
};

var CONVERT_MAP = Parameter.CONVERT_MAP = {
  number: 'number',
  int: 'int',
  integer: 'int',
  string: 'string',
  id: 'string',
  date: 'string',
  dateTime: 'string',
  datetime: 'string',
  boolean: 'bool',
  bool: 'bool',
  email: 'string',
  password: 'string',
  url: 'string',
};

/**
 * format a rule
 * - resolve abbr
 * - resolve `?`
 * - resolve default convertType
 *
 * @param {Mixed} rule
 * @return {Object}
 * @api private
 */

function formatRule(rule) {
  rule = rule || {};
  if (typeof rule === 'string') {
    rule = { type: rule };
  } else if (Array.isArray(rule)) {
    rule = { type: 'enum', values: rule };
  } else if (rule instanceof RegExp) {
    rule = { type: 'string', format: rule };
  }

  if (rule.type && rule.type[rule.type.length - 1] === '?') {
    rule.type = rule.type.slice(0, -1);
    rule.required = false;
  }

  rule.message = rule.message || {}
  if (typeof rule.message === 'string') {
    rule.message = {
      [rule.type]: rule.message,
    }
  }

  return rule;
}

/**
 * convert param to specific type
 * @param {Object} rule
 * @param {Object} obj
 * @param {String} key
 * @param {Boolean} defaultConvert
 */
function convert(rule, obj, key, defaultConvert) {
  var convertType;
  if (defaultConvert) convertType = CONVERT_MAP[rule.type];
  if (rule.convertType) convertType = rule.convertType;
  if (!convertType) return;

  const value = obj[key];
  // convert type only work for primitive data
  if (typeof value === 'object') return;

  // convertType support function
  if (typeof convertType === 'function') {
    obj[key] = convertType(value, obj);
    return;
  }

  switch (convertType) {
    case 'int':
      obj[key] = parseInt(value, 10);
      break;
    case 'string':
      obj[key] = String(value);
      break;
    case 'number':
      obj[key] = Number(obj[key]);
      break;
    case 'bool':
    case 'boolean':
      obj[key] = !!value;
      break;
    default:
      // support convertType function added by addRule
      if (typeof CONVERT_MAP[convertType] === 'function' ) {
        obj[key] = CONVERT_MAP[rule.type](obj[key]);
      }
  }
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
    return this.message(rule, 'int', this.t('should be an integer'));
  }

  if (rule.hasOwnProperty('max') && value > rule.max) {
    return this.message(rule, 'max', this.t('should smaller than %s', rule.max));
  }

  if (rule.hasOwnProperty('min') && value < rule.min) {
    return this.message(rule, 'min', this.t('should bigger than %s', rule.min));
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
  if (typeof value !== 'number' || isNaN(value)) {
    return this.message(rule, 'number', this.t('should be a number'));
  }
  if (rule.hasOwnProperty('max') && value > rule.max) {
    return this.message(rule, 'max', this.t('should smaller than %s', rule.max));
  }
  if (rule.hasOwnProperty('min') && value < rule.min) {
    return this.message(rule, 'min', this.t('should bigger than %s', rule.min));
  }
}

/**
 * check string
 * {
 *   allowEmpty: true, // resolve default convertType to false, alias to empty)
 *   format: /^\d+$/,
 *   max: 100,
 *   min: 0,
 *   trim: false,
 * }
 *
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkString(rule, value) {
  if (typeof value !== 'string') {
    return this.message(rule, rule.type || 'string', this.t('should be a string'));
  }

  // if required === false, set allowEmpty to true by default
  if (!rule.hasOwnProperty('allowEmpty') && rule.required === false) {
    rule.allowEmpty = true;
  }

  var allowEmpty = rule.hasOwnProperty('allowEmpty')
    ? rule.allowEmpty
    : rule.empty;

  if (!value) {
    if (allowEmpty) return;
    return this.message(rule, 'allowEmpty', '') || this.message(rule, 'empty', '') || this.t('should not be empty');
  }

  if (rule.hasOwnProperty('max') && value.length > rule.max) {
    return this.message(rule, 'max', this.t('length should smaller than %s', rule.max));
  }
  if (rule.hasOwnProperty('min') && value.length < rule.min) {
    return this.message(rule, 'min', this.t('length should bigger than %s', rule.min));
  }

  if (rule.format && !rule.format.test(value)) {
    return this.message(rule, 'format', this.t('should match %s', rule.format));
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
  const errorMessage = checkString.call(this, { format: ID_RE, allowEmpty: rule.allowEmpty }, value);
  if (errorMessage) {
    return this.message(rule, 'id', errorMessage);
  }
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
  const errorMessage = checkString.call(this, { format: DATE_TYPE_RE, allowEmpty: rule.allowEmpty }, value);
  if (errorMessage) {
    return this.message(rule, 'date', errorMessage);
  }
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
  const errorMessage = checkString.call(this, { format: DATETIME_TYPE_RE, allowEmpty: rule.allowEmpty }, value);
  if (errorMessage) {
    return this.message(rule, 'dateTime', errorMessage);
  }
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
    return this.message(rule, 'bool', '') || this.message(rule, 'boolean', '') || this.t('should be a boolean');
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
    return this.message(rule, 'enum', this.t('should be one of %s', rule.values.join(', ')));
  }
}

/**
 * check email
 *
 * @param {Object} rule
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function checkEmail(rule, value) {
  const errorMessage = checkString.call(this, {
    format: EMAIL_RE,
    allowEmpty: rule.allowEmpty,
  }, value);
  if (errorMessage) {
    return this.message(rule, 'email', this.t('should be an email'));
  }
}

/**
 * check password
 * @param {Object} rule
 * @param {Object} value
 * @param {Object} obj
 * @return {Boolean}
 *
 * @api private
 */

function checkPassword(rule, value, obj) {
  if (!rule.min) {
    rule.min = 6;
  }
  rule.format = PASSWORD_RE;
  var error = checkString.call(this, rule, value);
  if (error) {
    return this.message(rule, 'password', error);
  }
  if (rule.compare && obj[rule.compare] !== value) {
    return this.message(rule, 'compare', this.t('should equal to %s', rule.compare));
  }
}

/**
 * check url
 *
 * @param {Object} rule
 * @param {Object} value
 * @return {Boolean}
 * @api private
 */

function checkUrl(rule, value) {
  const error = checkString.call(this, {
    format: URL_RE,
    allowEmpty: rule.allowEmpty
  }, value);
  if (error) {
    return this.message(rule, 'url', this.t('should be a url'));
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
    return this.message(rule, 'object', this.t('should be an object'));
  }

  if (rule.rule) {
    return this.validate(rule.rule, value);
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
    return this.message(rule, 'array', this.t('should be an array'));
  }

  if (rule.hasOwnProperty('max') && value.length > rule.max) {
    return this.message(rule, 'max', this.t('length should smaller than %s', rule.max));
  }
  if (rule.hasOwnProperty('min') && value.length < rule.min) {
    return this.message(rule, 'min', this.t('length should bigger than %s', rule.min));
  }

  if (!rule.itemType) {
    return;
  }

  var self = this;
  var checker = TYPE_MAP[rule.itemType];
  if (!checker) {
    throw new TypeError('rule type must be one of ' + Object.keys(TYPE_MAP).join(', ') +
        ', but the following type was passed: ' + rule.itemType);
  }

  var errors = [];
  var subRule = rule.itemType === 'object'
  ? rule
  : rule.rule || formatRule(rule.itemType);

  value.forEach(function (v, i) {
    var index = '[' + i + ']';
    var errs = checker.call(self, subRule, v);

    if (typeof errs === 'string') {
      errors.push({
        field: index,
        message: errs,
        code: self.t('invalid')
      });
    }
    if (Array.isArray(errs)) {
      errors = errors.concat(errs.map(function (e) {
        e.field = index + '.' + e.field;
        e.message = e.message;
        return e;
      }));
    }
  });

  return errors;
}
