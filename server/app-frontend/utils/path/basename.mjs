/**
 * *****************************************************************************
 *
 * basename
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';

export function basename (path, ext) {
  assert(typeof path === 'string', `basename function need a string paramater.`);

  let index = 0;

  for (let i = path.length - 1; i > -1; i--) {
    if (path[i] === '/') {
      index = i + 1 ; 
      break;
    }
  }

  const baseName = path.substr(index); 

  return ext 
    ? baseName.substr(-ext.length) === ext 
      ? baseName.substr(0, baseName.length - ext.length)
      : baseName
    : baseName;
}
