/**
 * *****************************************************************************
 * 
 * 任务列表
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import path from 'path';

import settings from '../src/config/settings.mjs';
const paths = settings.paths;

export default new Proxy({
  "generateCSS": function () { 
    return cp.spawn(path.join(paths.BIN, 'css-render.mjs'));
  }
}, {
  get: function (target, property, receiver) {
		return Reflect.get(target, property, receiver);
  },
});

