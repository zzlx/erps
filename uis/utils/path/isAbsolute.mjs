/**
 * *****************************************************************************
 *
 * is absolute path
 *
 * @param {string} path
 * @return {boolean} 
 * *****************************************************************************
 */

import { isURLPath } from './isURLPath.mjs';
import { isPathSeparator } from './isPathSeparator.mjs';
import { isWindowsDeviceRoot } from './isWindowsDeviceRoot.mjs';

export function isAbsolute(path) {
  if (path.length === 0) return false;
  if (isURLPath(path)) return true;

  const code = path.charCodeAt(0);

  return isPathSeparator(code) ||
    (path.length > 2 &&
      isWindowsDeviceRoot(code) &&
      path.charCodeAt(1) === CHAR_COLON &&
      isPathSeparator(path.charCodeAt(2)));
}

