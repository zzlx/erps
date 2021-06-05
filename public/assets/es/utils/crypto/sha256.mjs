/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { SHA256 } from './SHA256.mjs';

export function sha256 () {
  const msg = [...arguments].join('');
  return new SHA256().update(msg).digest(); 
}

console.time('test');
console.log('%s', sha256('w'));
console.timeEnd('test');
/*
*/
