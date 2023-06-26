/**
 * *****************************************************************************
 *
 * package.json 配置管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import { paths } from './paths.mjs';

const packageJSON = readJSON(paths.PACKAGE);

export const appinfo = new Proxy(packageJSON, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
    if (target[property] === undefined) return false;
    if (property === 'dependencies') {
    }

    target[property] = value;
    writeJSON(paths.PACKAGE, target);
    return true;
  }
});

function readJSON (path) {
  const json = JSON.parse(fs.readFileSync(path));
  return json;
}

function writeJSON (path, json) {
  return fs.promises.writeFile(
    path, 
    typeof json === "string" 
      ? json 
      : typeof json === 'object' ? JSON.stringify(target, null, 2) : null
  );
}
