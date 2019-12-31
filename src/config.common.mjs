/**
 * Common configuration
 *
 */

import fs from 'fs';
import path from 'path';


// 配置项目
export const APP_PATH = path.dirname(path.dirname(import.meta.url).substr(7));
export const APP_ROOT = APP_PATH;
const PackageJSON = JSON.parse(fs.readFileSync(path.join(APP_ROOT, 'package.json')));
export const APP_NAME = PackageJSON.name;
export const APP_HOME = path.join(process.env.HOME, `.${APP_NAME}`); // APP_HOME目录
export const APP_LICENSE = PackageJSON.license;
export const APP_VERSION = PackageJSON.version;
export const DOT_ENV_FILE = path.join(APP_ROOT, '.env');

// git information 
const GIT_HEAD_FILE = path.join(APP_ROOT, '.git/HEAD');
const GIT_HEAD_REF = String(fs.readFileSync(GIT_HEAD_FILE, 'utf8')).slice(5).trim();
const GIT_COMMIT_FILE = path.join(APP_ROOT, `.git/${GIT_HEAD_REF}`);
export const APP_BRANCH = path.basename(GIT_HEAD_REF);
export const APP_BRANCH_VERSION = fs.readFileSync(GIT_COMMIT_FILE);
