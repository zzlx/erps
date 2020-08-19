/**
 * *****************************************************************************
 *
 * Configuration manager
 *
 * 配置项来源: 
 * 1. 系统默认配置项目
 * 2. config.json文件 
 *
 * 配置项目优先级
 *
 *
 * 约定:
 * 模块输出项目均为文本字符串类型数据
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

const __filename = import.meta.url.substr(7);
const __dirname = path.dirname(__filename);
const __basename = path.basename(__filename);
const debug = util.debuglog(`debug:${__basename}`);
const APP_ROOT = path.dirname(__dirname);
const PackageJSON = JSON.parse(fs.readFileSync(path.join(APP_ROOT, 'package.json'), 'utf8'));
const APP_HOME = path.join(os.homedir(), `.${PackageJSON.name}`);

class Config {
  constructor() {
    this.env = process.env.NODE_ENV || 'production';
    this.paths = {
      appRoot: APP_ROOT,
      appHome: APP_HOME, 
      logPath: path.join(APP_HOME, 'log'),
      configJsonFile: path.join(APP_HOME, 'config.json'),
      pidFile: path.join(APP_HOME, `${process.title}.pid`),
      mainApp: path.join(APP_ROOT, 'server', 'main.mjs'),
      buildPath: path.join(APP_HOME, 'build'), // 用于存储生成的前端文件
      scssEntryPoint: path.join(APP_ROOT, 'styles', 'main.scss'),
      public: path.join(APP_ROOT, 'public'),
      templateHtml: path.join(APP_ROOT, 'public', 'index.html'),
      stylesCss: path.join(APP_ROOT, 'public', 'statics', 'styles.css'),
      nodeModules: path.join(APP_ROOT, 'node_modules'),
    };

    // configurable
    this.configurable = {};

    // @task: 准备必要的目录
    this.readyPaths(
      this.paths.appHome,
      this.paths.logPath,
    );

    this.readConfigFile();
  }



  /**
   * read config file
   */
  readConfigFile () {
    fs.open(this.paths.configJsonFile, 'a+', (err, fd) => {
      if (err) throw err;
      
      fs.read(fd, (err, bytesRead, buffer) => {
        if (err) throw err;
        const configJSON = buffer.toString('utf8');
        try {
          //this.config = JSON.parse(configJSON);
        } catch (err) {
          throw err;
        }
      });

      // close file
      fs.close(fd, (err) => {
        if (err) throw err;
      });
    });
  }

  /**
   * ready paths
   *
   * @param {string} paths
   * @api public
   */

  readyPaths () {
    let paths = Array.prototype.slice.call(arguments);

    for (let path of paths) {
      if (typeof path !== 'string') throw new TypeError('paths must be string.');

      fs.mkdir(path, { recursive: true }, err => {
        if (err) throw err;
      });
    }

  }
}

export default new Config();
