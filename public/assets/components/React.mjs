/**
 * *****************************************************************************
 *
 *
 *
 *
 * *****************************************************************************
 */

import settings from '../settings.mjs';

const React = settings.isBrowser 
  ? globalThis.React 
  : import('react').then(m => m.default);

export default React;
