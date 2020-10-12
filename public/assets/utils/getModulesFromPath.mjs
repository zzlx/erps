/**
 * *****************************************************************************
 *
 * 读取目录模块 
 *
 * 遍历文件并读入模块对象中
 *
 * @file getModulesFromPath.mjs
 * *****************************************************************************
 */

import path from 'path';
import fs from 'fs';

export default function getModules (dir) {

  if (!path.isAbsolute(dir)) dir = path.join(process.cwd(), dir);

  // return a promise 
  return fs.promises.readdir(dir, { 
    encoding: 'utf8', 
    withFileTypes: true,
  }).then( async (files) => {
    const Modules = {};

    for (let f of files) {
      if (f.isDirectory()) {
        Modules[f.name] = await getModules(path.join(dir, f.name));
      }

      if (f.isFile() && f.name.match(/\.mjs$/)) {
        await import(path.join(dir, f.name)).then(fn => {
          Modules[path.basename(f.name, '.mjs')] = fn.default ? fn.default : fn;
        }).catch(err => {
          console.log('file: %s %o', f.name, err);
        });
      }
    }

    return Modules;
  });
}
