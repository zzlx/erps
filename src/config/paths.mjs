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
const __ROOT = path.dirname(path.dirname(__dirname));
const paths = readPath(__ROOT);
const packageJSON = paths.PACKAGE 
  ? JSON.parse(fs.readFileSync(paths.PACKAGE))
  : {};

export default new Proxy(paths, {
  get: function (target, property, receiver) {
    if (property === 'ROOT') return __ROOT;
    if (property === 'HOME') return path.join(os.homedir(), `.${packageJSON.name}`);

    return Reflect.get(target, property, receiver);
  },
	//set: function (target, property, value) { },
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
