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

const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');

const PackageJSON = require('../package.json');

const __basename = path.basename(__filename);
const debug = util.debuglog(`debug:${__basename}`);
const APP_ROOT = path.dirname(__dirname);
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
      serverPath: path.join(APP_ROOT, 'src', 'server.mjs'),
      buildPath: path.join(APP_HOME, 'build'), // 用于存储生成的前端文件
      scssEntryPoint: path.join(APP_ROOT, 'scss', 'main.scss'),
    };

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

module.exports = new Config();
