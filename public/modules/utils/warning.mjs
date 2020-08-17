/**
 * *****************************************************************************
 *
 * Prints a warning in the console if it exists.
 *
 * @param {Boolean} condition .
 * @param {String} message The warning message.
 * @returns {void}
 * *****************************************************************************
 */

export default function warning () {
  let message, condition;

  if (arguments.length === 0) return;
  if (arguments.length === 1) message = arguments[0];
  if (arguments.length === 2) {
    condition = arguments[0];
    message = arguments[1];
  }

  if (!!condition) return; 
  if (console && console.warn) console.warn(message)
  else console.log('Warning! ', message);
}
