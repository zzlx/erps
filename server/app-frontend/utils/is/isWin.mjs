/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { isBrowser } from './isBrowser.mjs';
export const isWin = () => !isBrowser && 
  globalThis.process && 
  globalThis.process.platform === 'win32';
