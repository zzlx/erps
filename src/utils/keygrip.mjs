/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import crypto from 'crypto';
  
export default function Keygrip(keys, algorithm = 'sha256', encoding = 'base64') {
  if (!keys || !(0 in keys)) {
    throw new Error("Keys must be provided.");
  }

  function sign(data, key) {
    return crypto
      .createHmac(algorithm, key)
      .update(data)
      .digest(encoding)
      .replace(/\/|\+|=/g, x => ({ "/": "_", "+": "-", "=": "" })[x]);
  }

  this.sign = (data) => sign(data, keys[0]);

  this.verify = (data, digest) => this.index(data, digest) > -1

  this.index = (data, digest) => {
    for (let i = 0; i < keys.length; i++) {
      if (constantTimeCompare(digest, sign(data, keys[i]))) return i
    }

    return -1
  }
}

Keygrip.sign = Keygrip.verify = Keygrip.index = function() {
  throw new Error("Usage: require('keygrip')(<array-of-keys>)")
}

//http://codahale.com/a-lesson-in-timing-attacks/
function constantTimeCompare (val1, val2) {
    if(val1 == null && val2 != null){
        return false;
    } else if(val2 == null && val1 != null){
        return false;
    } else if(val1 == null && val2 == null){
        return true;
    }

    if(val1.length !== val2.length){
        return false;
    }

    let result = 0;

    for(let i = 0; i < val1.length; i++){
        result |= val1.charCodeAt(i) ^ val2.charCodeAt(i); //Don't short circuit
    }

    return result === 0;
}
