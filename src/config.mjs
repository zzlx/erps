/**
 * 通用配置
 *
 * 为代码库提供配置项目
 *
 * @file: config.mjs
 */

/******************************************************************************/
import fs from 'fs';
import path from 'path';

// 配置项目
export const APP_ROOT = path.dirname(path.dirname(import.meta.url).substr(7));
export const APP_PATH = APP_ROOT;
const packageJSON_file = path.join(APP_ROOT, 'package.json');

export const PackageJSON = JSON.parse(fs.readFileSync(packageJSON_file));
export const APP_NAME     = PackageJSON.name;
export const APP_VERSION  = PackageJSON.version;
export const APP_LICENSE  = PackageJSON.license;
export const APP_HOME     = path.join(process.env.HOME, `.${APP_NAME}`);
export const DOT_ENV_FILE = path.join(APP_ROOT, '.env');
export const VIMRC_FILE   = path.join(APP_ROOT, 'vimrc');
export const README_FILE  = path.join(APP_ROOT, 'README.md');
export const HELP_FILE    = path.join(APP_ROOT, 'src', 'help.txt');
export const CONFIG_FILE  = path.join(APP_HOME, 'config.json');

// 从HEAD文件中读取git branch当前分支ref
const GIT_HEAD_FILE = path.join(APP_ROOT, '.git/HEAD');
const GIT_HEAD_REF = String(fs.readFileSync(GIT_HEAD_FILE)).slice(5).trim();
const GIT_COMMIT_FILE = path.join(APP_ROOT, `.git/${GIT_HEAD_REF}`);

export const APP_BRANCH = path.basename(GIT_HEAD_REF);
// 从REF文件中读取版本信息
export const APP_BRANCH_VERSION = fs.readFileSync(GIT_COMMIT_FILE);
