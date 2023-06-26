/**
 * *****************************************************************************
 *
 * readDir
 *
 * 算法:循环读取目录,返回路径列表
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';

export function readDir (dir) {
  let files = [];
  
  if (Array.isArray(dir)) { 
    for (let d of dir) {
      files.push(...readDir(d)); 
    }
  }

  if (typeof dir === 'string' && fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
      const filePath = path.join(dir, file.name);
      if (file.isFile()) files.push(filePath);
      if (file.isDirectory()) files = files.concat(readDir(filePath));
    }
  }

  return files;
}
