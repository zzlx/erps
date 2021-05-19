/**
 * *****************************************************************************
 *
 *
 *
 * *****************************************************************************
 */

import { btoa } from './btoa.mjs';
import { isPlainObject } from '../isPlainObject.mjs';

export function encode (str, url_safe = false) {
  const base64 = typeof str === 'object' && isPlainObject(str)
    ? btoa(JSON.stringify(str)) 
    : btoa(str);

  return url_safe === true
    ? base64 
    : base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
