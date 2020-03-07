/**
 * *****************************************************************************
 *
 * 系统配置项
 *
 * 约定:
 * 模块输出项目均为文本字符串类型数据
 *
 * @file: sys.config.mjs
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

const debug = util.debuglog('debug:sysconfig');

// 定位代码库根目录
export const APP_ROOT = path.dirname(path.dirname(import.meta.url).substr(7));
export const APP_PATH = APP_ROOT;

// 获取package.json配置信息
export const PACKAGE_JSON_FILE  = path.join(APP_ROOT, 'package.json');
const PACKAGE_JSON = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE));
export const APP_NAME     = PACKAGE_JSON.name;
export const APP_LICENSE  = PACKAGE_JSON.license;
export const APP_VERSION  = PACKAGE_JSON.version;

// 获取git代码库信息
const GIT_HEAD_FILE = path.join(APP_ROOT, '.git/HEAD'); // HEAD文件记录当前分支ref
const GIT_HEAD_REF = String(fs.readFileSync(GIT_HEAD_FILE)).slice(5).trim();

export const GIT_COMMIT_FILE = path.join(APP_ROOT, `.git/${GIT_HEAD_REF}`);
export const APP_BRANCH_NAME = path.basename(GIT_HEAD_REF); // 当前代码分支
export const APP_BRANCH_VERSION = String(fs.readFileSync(GIT_COMMIT_FILE)).trim();

// 配置系统常用目录
export const HOME_DIR    = os.homedir(); // process.env.HOME
export const CONFIG_DIR  = path.join(HOME_DIR, `.${APP_NAME}`);
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
export const LOG_DIR     = path.join(CONFIG_DIR, 'log');

export const DOT_ENV_FILE = path.join(APP_ROOT, '.env');
export const VIMRC_FILE   = path.join(APP_ROOT, '.vimrc');
export const DIST_DIR     = path.join(APP_ROOT, 'dist');
export const README_FILE  = path.join(APP_ROOT, 'README.md');
export const HELP_FILE    = path.join(APP_ROOT, 'src', 'help.txt');

export const TEMP_DIR     = os.tmpDir();

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
