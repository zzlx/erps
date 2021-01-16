/**
 * *****************************************************************************
 *
 * 文件读取
 *
 * 返回一个对象 
 *
 * @param {string} filepath
 * @param {function} cb
 * @return {object} obj
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';

const readStream = (file, cb) => new Proxy({},{
});

export default readStream;

function readline (file, cb) {
  let data = null;

  try {
    fs.createReadStream(file).on('readable', onReadable);
  } catch (err) {
    if (typeof cb === 'function') return cb(err);
  }

  function onReadable () {
    console.log(this);
  }
}

// @TEST
readline('./README.md');
