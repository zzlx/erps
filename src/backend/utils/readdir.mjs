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
import { arrayFlatten } from "./index.mjs";

export function readdir (_root) {
  if (Array.isArray(_root)) {
    return Promise.all(_root.map(readdir)).then(arrayFlatten);
  }

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
  }).then(arrayFlatten)
    .then(paths => paths.map(p => p.name ? path.join(p.path, p.name) : p));
}
