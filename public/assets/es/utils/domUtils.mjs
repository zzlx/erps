export const domUtils = {}

const canUseDOM = !!(
  typeof window !== 'undefined' && 
  window.document && 
  window.document.createElement
);

const addEventListener = (node, event, listener) => node.addEventListener 
  ? node.addEventListener(event, listener, false) 
  : node.attachEvent('on' + event, listener);

const removeEventListener = (node, event, listener) => node.removeEventListener
  ? node.removeEventListener(event, listener, false) 
  : node.detachEvent('on' + event, listener);

const getConfirmation = (message, callback) => callback(window.confirm(message));

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
const supportsHistory = () => {
  return window.history && 'pushState' in window.history;
}

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
const supportsPopStateOnHashChange = () => 
  window.navigator.userAgent.indexOf('Trident') === -1;

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
const supportsGoWithoutReloadUsingHash = () => 
  window.navigator.userAgent.indexOf('Firefox') === -1;

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
const isExtraneousPopstateEvent = event => 
  event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;

export default  {
  canUseDOM,
  addEventListener, 
  removeEventListener, 
  getConfirmation, 
  supportsHistory, 
  supportsPopStateOnHashChange, 
  supportsGoWithoutReloadUsingHash, 
  isExtraneousPopstateEvent,
}
