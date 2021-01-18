/**
 * *****************************************************************************
 *
 * 循环读取目录,返回文件路径列表
 *
 * @param {string} dir
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';

export default function readDir (dir) {
  let files = []; // 文件列表
  
  if (Array.isArray(dir)) {
    for (let d of dir) files = files.concat(readDir(d));
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
