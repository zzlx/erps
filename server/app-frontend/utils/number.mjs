/**
 * *****************************************************************************
 *
 * Numerical utils
 * ===============
 *
 *
 * *****************************************************************************
 */

export const number = new Proxy({
}, {
	get: function (target, property, receiver) {
		return Reflect.get(target, property, receiver);
  }
});

const formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
const formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g;
const parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb)$/i;
const map = {
  b:  1,
  kb: 1 << 10, 
  mb: 1 << 20,
  gb: 1 << 30,
  tb: Math.pow(1024, 4),
  pb: Math.pow(1024, 5),
}

function Numerical (opts) {
  // 参数处理
  const decimalPlaces = (opts && opts.decimalPlaces !== undefined) ? opts.decimalPlaces : 2;
  const fixedDecimals = Boolean(opts && opts.fixedDecimals);
  const thousandsSeparator = (opts && opts.thousandsSeparator) || '';
  const unitSeparator = (opts && opts.unitSeparator) || '';
  const unit = opts && opts.unit;
  const symbol = opts.symbol || false;
  let value = opts.children || opts.value || '';  

  if ('number' === typeof value) {
    if (!Number.isFinite(value)) return '';
    if (Number.isNaN(value)) return '';
  }

  // 处理为保留小数位的字符串
  // Number.parseFloat: 把一个字符串解析成浮点数
  // Number.toFixed: 使用定点表示法表示给定数字的字符串 
  let strNumber = Number.parseFloat(value).toFixed(decimalPlaces);

  if (!fixedDecimals) {
    strNumber = strNumber.replace(formatDecimalsRegExp, '$1');
  }

  if (thousandsSeparator) {
    strNumber = strNumber.replace(formatThousandsRegExp, ',');
  }

  if (symbol) strNumber = symbol + strNumber;
  if (unit) strNumber += unit;

  return strNumber; 
}

/**
 * Parse the string value into an integer in bytes.
 *
 * If no unit is given, it is assumed the value is in bytes.
 *
 * @param {number|string} val
 *
 * @returns {number|null}
 * @public
 */

function parse(val) {
  if (typeof val === 'number' && !isNaN(val)) {
    return val;
  }

  if (typeof val !== 'string') {
    return null;
  }

  // Test if the string passed is valid
  const results = parseRegExp.exec(val);
  let floatValue;
  let unit = 'b';

  if (!results) {
    // Nothing could be extracted from the given string
    floatValue = parseInt(val, 10);
    unit = 'b'
  } else {
    // Retrieve the value and the unit
    floatValue = parseFloat(results[1]);
    unit = results[4].toLowerCase();
  }

  return Math.floor(map[unit] * floatValue);
}

/**
 * Format the given value in bytes into a string.
 *
 * If the value is negative, it is kept as such. If it is a float,
 * it is rounded. 
 *
 * @param {number} value
 * @param {object} [options]
 * @param {number} [options.decimalPlaces=2]
 * @param {number} [options.fixedDecimals=false]
 * @param {string} [options.thousandsSeparator=]
 * @param {string} [options.unit=]
 * @param {string} [options.unitSeparator=]
 *
 * @returns {string|null}
 * @public
 */

function format(value, options) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const mag = Math.abs(value);
  const thousandsSeparator = (options && options.thousandsSeparator) || '';
  const unitSeparator = (options && options.unitSeparator) || '';
  const decimalPlaces = (options && options.decimalPlaces !== undefined) 
    ? options.decimalPlaces 
    : 2;
  const fixedDecimals = Boolean(options && options.fixedDecimals);
  let unit = (options && options.unit) || '';

  if (!unit || !map[unit.toLowerCase()]) {
    if (mag >= map.tb) {
      unit = 'TB';
    } else if (mag >= map.gb) {
      unit = 'GB';
    } else if (mag >= map.mb) {
      unit = 'MB';
    } else if (mag >= map.kb) {
      unit = 'KB';
    } else {
      unit = 'B';
    }
  }

  const val = value / map[unit.toLowerCase()];
  let str = val.toFixed(decimalPlaces);

  if (!fixedDecimals) {
    str = str.replace(formatDecimalsRegExp, '$1');
  }

  if (thousandsSeparator) {
    str = str.replace(formatThousandsRegExp, thousandsSeparator);
  }

  return str + unitSeparator + unit;
}

/**
 * Convert the given value in bytes into a string or parse to string to an integer in bytes.
 *
 * @param {string|number} value
 * @param {object} [options]
 * @param {string} [options.case]
 * @param {number} [options.decimalPlaces]
 * @param {number} [options.fixedDecimals]
 * @param {string} [options.thousandsSeparator]
 * @param {string} [options.unitSeparator]
 *
 * @returns {string|number|null}
 */

function bytes(value, options) {
  if (typeof value === 'string') return parse(value);
  if (typeof value === 'number') return format(value, options);
  return null;
}
