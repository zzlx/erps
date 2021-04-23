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
  let message, condition;

  if (arguments.length === 0) return;
  if (arguments.length === 1) message = arguments[0];
  if (arguments.length === 2) {
    condition = arguments[0];
    message = arguments[1];
  }

  if (!!condition) return; 
  if (console && console.warn) return console.warn(message);
  console.log('Warning: ', message);
}
