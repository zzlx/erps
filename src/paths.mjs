/**
 * *****************************************************************************
 *
 * 系统目录配置
 * ============
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

// Locate the root path of app source
const __filename = import.meta.url.substr(7);
const __dirname = path.dirname(__filename);
const __ROOT = path.dirname(__dirname);
const paths = readPath(__ROOT);

const packageJSON = paths.PACKAGE 
  ? JSON.parse(fs.readFileSync(paths.PACKAGE))
  : {};

export default new Proxy(paths, {
  get: function (target, property, receiver) {
    if (property === 'ROOT') return __ROOT;
    if (property === 'API') return path.join(target.SERVER, 'api');

    if (property === 'LOG') {
      if (target['LOG']) return target['LOG'];
      const logPath = path.join(__ROOT, 'log');
      fs.mkdirSync(logPath);
      return logPath;
    }

    if (property === 'CONFIG') {
      if (target['CONFIG']) return target['CONFIG'];
      const configPath = path.join(__ROOT, 'config');
      fs.mkdirSync(cofigPath);
      return configPath;
    }

    if (property === 'DATA') {
      return path.join(os.homedir(), 'data');
    }

    return Reflect.get(target, property, receiver);
  }
});

/**
 * Read paths from root path
 */

function readPath (dir) {
  const paths = {};
  const files = fs.readdirSync(dir, {withFileTypes: true});

  for (let file of files) {
    const name = String.prototype.toUpperCase.call(file.name)
      .replace(/^\./, '')
      .replace(/(\..+)$/, '') ;
    paths[name] = path.join(dir, file.name);
  }

  return paths;
}
