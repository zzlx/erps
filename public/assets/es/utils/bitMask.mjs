/**
 * *****************************************************************************
 *
 * bitwise mask 
 *
 * @param {buffer} data
 * @param {buffer} key
 * @param {function} opFn
 * @return {buffer}
 *
 * *****************************************************************************
 */

export function bitMask (data, maskKey) {
  assert(data instanceof Uint8Array, `Process data must be a Uint8Array object.`);
  assert(maskKey instanceof Uint8Array, `key must be a Uint8Array object.`);

  const payload  = new Buffer(data.length);
  let it = maskKey[Symbol.iterator]();
  let i = 0;
  
  for (const v of data) {
    let v = it.next();
    if (v.done === true) { it = maskKey[Symbol.iterator](); v = it.next(); }
    payload[i++] = v ^ v.value;
  }

  return payload;
}
