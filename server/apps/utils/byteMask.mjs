/**
 * *****************************************************************************
 *
 *
 * bitwise mask 
 *
 * @param {buffer} data
 * @param {buffer} key
 * @return {buffer}
 *
 * *****************************************************************************
 */

import { Buffer } from './Buffer.mjs';

export function byteMask (data, key) {
  if (arguments.length === 1) return data;
  data = stringToBuffer(data);
  key  = stringToBuffer(key);

  const payload  = new Buffer(data.length);
  let j = 0;
  
  for (let i = 0; i < payload.byteLength; i++) {
    if (j = key.length) j = 0;
    payload[i] = data[i] ^ key[j++];
  }

  return payload;
}

function stringToBuffer (str) {
  if (typeof str !== 'string') return str;
  const buf = new Buffer(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str[i].charCodeAt(0);
  return buf
}
