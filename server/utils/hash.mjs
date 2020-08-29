/**
 * *****************************************************************************
 *
 * 哈希算法 
 * 
 * 
 * *****************************************************************************
 */ 

import crypto from 'crypto';

function sha1(bytes) {
  if (typeof Buffer.from === 'function') {
    // Modern Buffer API
    if (Array.isArray(bytes)) {
      bytes = Buffer.from(bytes);
    } else if (typeof bytes === 'string') {
      bytes = Buffer.from(bytes, 'utf8');
    }
  } else {
    // Pre-v4 Buffer API
    if (Array.isArray(bytes)) {
      bytes = new Buffer(bytes);
    } else if (typeof bytes === 'string') {
      bytes = new Buffer(bytes, 'utf8');
    }
  }

  return crypto.createHash('sha1').update(bytes).digest('hex');
}

function md5(bytes) {
  // Modern Buffer API
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }
  return crypto.createHash('md5').update(bytes).digest('hex');
}

export default {
  md5,
  sha1
}
