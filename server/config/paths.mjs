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

const __filename = import.meta.url.substr(7);
const __dirname = path.dirname(__filename);
const __ROOT = path.dirname(path.dirname(__dirname));
const PackageJSON = JSON.parse(fs.readFileSync(path.join(__ROOT, 'package.json'), 'utf8'));
const APP_HOME = path.join(os.homedir(), `.${PackageJSON.name}`);

export default new Proxy({
  appRoot: __ROOT, 
  appHome: APP_HOME, 
  configFile: path.join(APP_HOME, 'config.json'),
  dataPath: path.join(os.homedir(), 'data'),
  logPath: path.join(APP_HOME, 'log'),
  mainApp: path.join(__ROOT, 'server', 'main.mjs'),
  nodeModules: path.join(__ROOT, 'node_modules'),
  public: path.join(__ROOT, 'public'),
  serverPath: path.join(__ROOT, 'server'),
  scssPath: path.join(__ROOT, 'public', 'statics', 'styles'),
  scssEntryPoint: path.join(__ROOT, 'styles', 'main.scss'),
  cssFile: path.join(__ROOT, 'public', 'statics', 'styles.css'),
  tasksPath: path.join(__ROOT, 'server', 'tasks'),
}, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
	set: function (target, property, value) {
  },
});
