/**
 * *****************************************************************************
 *
 * is path seprator
 *
 * *****************************************************************************
 */

export function isPathSeparator (code) {
  return code === '/'.charCodeAt(0) || code === '\\'.charCodeAt(0);
}

