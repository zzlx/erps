/**
 * 通用配置文件
 *
 * @file: config.mjs
 */

/******************************************************************************/
import fs from 'fs';
import os from 'os';
import path from 'path';
import isJSON from './utils/isJSON.mjs';

// 定位代码库根目录
export const APP_ROOT = path.dirname(path.dirname(import.meta.url).substr(7));
export const APP_PATH = APP_ROOT;

// 推荐NODE主版本号
export const RECOMMEND_NODE_VERSION = 13;

// get configuration from package.json
const packageJSON = path.join(APP_ROOT, 'package.json');
export const PACKAGE_JSON = JSON.parse(fs.readFileSync(packageJSON));
export const APP_NAME     = PACKAGE_JSON.name;
export const APP_VERSION  = PACKAGE_JSON.version;
export const APP_LICENSE  = PACKAGE_JSON.license;

// 配置常用目录 
export const PUBLIC_HTML  = path.join(process.env.HOME, 'public_html');
export const APP_HOME     = path.join(process.env.HOME, `.${APP_NAME}`);
export const APP_LOG_PATH = path.join(APP_HOME, 'log');
export const DOT_ENV_FILE = path.join(APP_ROOT, '.env');
export const VIMRC_FILE   = path.join(APP_ROOT, 'vimrc');
export const README_FILE  = path.join(APP_ROOT, 'README.md');
export const HELP_FILE    = path.join(APP_ROOT, 'src', 'help.txt');
export const CONFIG_FILE  = path.join(APP_HOME, 'config.json');

const config =  fs.readFileSync(CONFIG_FILE, 'utf8'); 
export const CONFIG = JSON.parse(isJSON(config) ? config : '{}');

export const TMP_DIR  = os.tmpdir();
export const EOL  = os.EOL;

// 获取代码库git版本信息
//
// 从HEAD文件中读取git branch当前分支ref
const GIT_HEAD_FILE = path.join(APP_ROOT, '.git/HEAD');
const GIT_HEAD_REF = String(fs.readFileSync(GIT_HEAD_FILE)).slice(5).trim();

// 获取当前代码分支
export const APP_BRANCH_NAME = path.basename(GIT_HEAD_REF);

// 从REF文件中读取版本信息
const GIT_COMMIT_FILE = path.join(APP_ROOT, `.git/${GIT_HEAD_REF}`);
export const APP_BRANCH_VERSION = String(fs.readFileSync(GIT_COMMIT_FILE)).trim();
