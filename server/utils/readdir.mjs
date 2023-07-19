/**
 * *****************************************************************************
 *
 * readdir
 *
 * 算法:循环读取目录,返回路径列表
 *
 * *****************************************************************************
 */

import fs from "node:fs";
import path from "node:path";
import { arrayFlatten } from "../utils/index.mjs";

export function readdir (_root) {
  return fs.promises.readdir(_root, { withFileTypes: true }).then(paths => {
    const newPaths = [];

    for (const p of paths) {
      if (p.isFile()) { newPaths.push(p); continue; } 

      if (p.isDirectory()) {
        const pathURI = path.join(p.path, p.name);
        newPaths.push(readdir(pathURI));
      }
    }

    return Promise.all(newPaths);
  }).then(paths => arrayFlatten(paths).map(p => path.join(p.path, p.name)));
}
