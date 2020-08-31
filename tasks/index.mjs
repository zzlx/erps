/**
 * *****************************************************************************
 * 
 *
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import path from 'path';
import config from '../config/default.mjs';

const paths = config.paths;

export default new Proxy({
  "generateCSS": function () { 
    return cp.spawn(path.join(paths.tasksPath, 'generateCSS.mjs'));
  }
}, {
  get: function (target, property, receiver) {
		return Reflect.get(target, property, receiver);
  },
});
