/**
 * *****************************************************************************
 *
 * Prints a warning message
 *
 * @param {Boolean} condition .
 * @param {String} message The warning message.
 * @returns {void}
 * *****************************************************************************
 */

export function warning () {
  const hasCond = typeof arguments[0] === 'boolean';
  const condition = hasCond ? arguments[0] : false;
  const message = hasCond ? Array.prototype.slice.call(arguments, 1) : arguments;

  if (!!condition) return; 
  if (console && console.warn) return console.warn.apply(null, message);
  if (console && console.log) {
    Array.prototype.unshift.call(message, '⚠️');
    return console.log.apply(null, message);
  }
}
