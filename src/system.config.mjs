/**
 * *****************************************************************************
 *
 * 系统配置
 *
 * 配置项来源: 1. .env文件；2.config.json文件 3. 系统默认配置项目
 *
 * 约定:
 * 模块输出项目均为文本字符串类型数据
 *
 * @file: config.mjs
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

// debug
const debug = util.debuglog('debug:config');

// 定位代码库根目录
export const APP_ROOT = path.dirname(path.dirname(import.meta.url).substr(7));
export const APP_PATH = APP_ROOT;

// 获取package.json配置信息
export const PACKAGE_JSON_FILE  = path.join(APP_ROOT, 'package.json');
const PACKAGE_JSON = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE));
export const APP_NAME     = PACKAGE_JSON.name;
export const APP_LICENSE  = PACKAGE_JSON.license;
export const APP_VERSION  = 'v' + PACKAGE_JSON.version;

// 配置系统常用目录
export const HOME_DIR    = os.homedir(); // process.env.HOME 
export const CONFIG_DIR  = path.join(HOME_DIR, `.${APP_NAME}`);
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
export const LOG_DIR     = path.join(CONFIG_DIR, 'log'); // 日志目录

export const DOT_ENV_FILE = path.join(APP_ROOT, '.env');
export const VIMRC_FILE   = path.join(APP_ROOT, '.vimrc');
export const DIST_DIR     = path.join(APP_ROOT, 'dist');
export const README_FILE  = path.join(APP_ROOT, 'README.md');
export const HELP_FILE    = path.join(APP_ROOT, 'doc', 'help.txt');

export const TEMP_DIR     = os.tmpDir();
export const PUBLIC_HTML = '/';

// 获取APP配置信息
let AppConfig = {};
if (fs.existsSync(CONFIG_FILE)) {
  try {
    AppConfig = JSON.parse(fs.readFileSync(CONFIG_FILE));
  } catch (e) { debug(e); }
}

export const APP_CONFIG = AppConfig; 

// 执行目录准备任务,创建系统需要的目录路径
(function readyDir () {
  const md = (dir) => fs.promises.mkdir(dir, {recursive: true})
    .then(() => true)
    .catch(() => false); 

  return Promise.all([
    md(CONFIG_DIR),
    md(LOG_DIR),
    md(DIST_DIR),
  ]);
})();
