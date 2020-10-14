/**
 * *****************************************************************************
 *
 *
 *
 *
 * *****************************************************************************
 */

import settings from '../settings.mjs';
export default settings.isBrowser 
  ? globalThis.React 
  : import('react').then(m => m.default);
