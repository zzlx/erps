/**
 * *****************************************************************************
 *
 * readDir
 *
 * 循环读取目录,返回文件路径数组.
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';

export default function readDir (dir) {
  let retval = [];
  
  if (Array.isArray(dir)) {
    for (let d of dir) {
      retval = retval.concat(readDir(d));
    }
  }

  if (typeof dir === 'string') {
    const files = fs.readdirSync(dir, {withFileTypes: true});

    for (let file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isFile()) retval.push(filePath);
      if (file.isDirectory()) {
        retval = retval.concat(readDir(filePath))
      }
    }
  }

  return retval;
}
