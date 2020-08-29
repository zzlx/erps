/**
 * *****************************************************************************
 *
 * 观察目录变动后执行callback任务
 * 
 * *****************************************************************************
 */ 

import crypto from 'crypto';
import fs from 'fs';
import readDir from './readDir.mjs';

// 数据存储器
const db = new Map();

export default function watchPath () {
  let callback = () => {};
  const paths = Array.prototype.slice.call(arguments);

  if (typeof(paths[paths.length - 1]) === 'function') {
    callback = paths.pop();
  }

  const files = readDir(paths);

  for (let file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const sha1 = crypto.createHash('sha1').update(content).digest('hex');

    if (db.has(file) && db.get(file) !== sha1) {
      console.log(`File: ${file} has been changed.`);
      db.set(file, sha1);
      callback();
      break;
    }

    db.set(file, sha1);
  }

  const timeout = setTimeout(() => watchPath(...arguments), 2000);
}
