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

export default new Proxy({
  "generateCSS": function () { 
    return cp.spawn(path.join(settings.paths.BIN, 'generateCSS.mjs'));
  }
}, {
  get: function (target, property, receiver) {
		return Reflect.get(target, property, receiver);
  },
});

