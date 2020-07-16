/**
 * *****************************************************************************
 *
 * 配置管理器
 *
 * 配置项来源: 
 * 1. .env文件；
 * 2.config.json文件 
 * 3. 系统默认配置项目
 *
 * 约定:
 * 模块输出项目均为文本字符串类型数据
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

const __dirname = path.dirname(import.meta.url).substr(7); // __dirname
const debug = util.debuglog('debug:config'); // debug

export default class Config {

  /**
   *
   *
   *
   */

  constructor (opts = {}) {
    this.appRoot = path.dirname(path.dirname(__dirname)); // 配置系统常用目录

    // 获取package.json配置信息
    const PACKAGE_JSON_FILE  = path.join(this.appRoot, 'package.json');
    const PACKAGE_JSON = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE));

    this.appName = PACKAGE_JSON.name;
    this.appVersion = PACKAGE_JSON.version;
    this.appHome = path.join(os.homedir(), '.' + this.appName);
    this.logDir = path.join(this.appHome, 'log');
    this.appTempDir = os.tmpdir();
  }

  /**
   *
   */

  toJSON () {

  }

  /**
   *
   */

  readConfig () {
    // 获取APP配置信息
    let AppConfig = {};

    if (fs.existsSync(CONFIG_FILE)) {
      AppConfig = JSON.parse(fs.readFileSync(CONFIG_FILE));
    }
  }
}
