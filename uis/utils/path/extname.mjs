/**
 * *****************************************************************************
 *
 * extname
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';

export function extname (path) {
  assert(typeof path === 'string', `extname‘s param must be a string.`);

  let index = path.length;

  for (let i = path.length - 1; i > -1; i--) {
    if (index === path.length && path[i] === '/') break;

    if (path[i] === '.') {
      index = i; 
      break;
    }
  }

  return path.substr(index);
}
