/**
 * *****************************************************************************
 *
 * Templates
 *
 * 模板文件
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

import { paths, appName, appVersion } from './paths.mjs';

export default new Proxy({ 
  html: fs.readFileSync(path.join(paths.SRC, 'templates', 'index.html')),
}, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
});
