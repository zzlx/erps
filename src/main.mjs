/**
 * *****************************************************************************
 *
 * 主控制程序
 *
 * 任务:
 * 1. 初始化运行环境
 * 2. 解析命令行参数,并执行相应配置功能
 * 3. 管理系统服务
 *
 * @file: main.mjs
 * *****************************************************************************
 */

// internal modules
import crypto from 'crypto';
import cp from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

// modules
import './env.mjs'; // 导入环境变量
import { 
  APP_NAME,
  APP_ROOT,
  APP_VERSION,
  APP_BRANCH_NAME,
  APP_BRANCH_VERSION,
  CONFIG_FILE,
  HELP_FILE,
  LOG_DIR,
} from './config.mjs';
import MongoDB from './utils/mongodb.mjs';
import console from './utils/console.mjs';
import array from './utils/arrayUtils.mjs';
import date from './utils/date.mjs';
import strings from './utils/strings.mjs';

const debug = util.debuglog('debug:main');

// 设置进程名称
process.title = APP_NAME; 

// 捕获exception
process.on('uncaughtException', (err, origin) => {
  console.log(err);
});

// 捕获unhandled rejection
process.on('unhandledRejection', async (reason, promise) => {
  console.log('捕获到Rejection:', promise);
  if (reason.codeName === 'Unauthorized' && reason.code === 13) {
    //Params.user = await readFromInput('请输入数据库用户名:');
    //Params.pwd = await readFromInput('请输入密码:'); 
    //await saveConfig(); // 保存一下配置文件
    //await main();
  }
});

class Main {
  constructor () {
    this.dba = null;
    this.httpd = null;
    this.config = {};
    this.checkNodeVersion(); // 检测node version
  }

  errorHandler () {

  }

}

/**
 * 执行程序
 */

Main.prototype.run = async function () {
  if (process.env.SHOW_ENV) return console.log(process.env); // 打印显示环境变量
  if (process.env.HELP || process.env.H) return showHelp(); // 显示帮助文件
  if (process.env.VERSION || process.env.V) return showVersion(); // 显示版本号
  if (process.env.SYSINFO) return showSysinfo(); // 显示系统信息
  if (process.env.SETUP) return setup(); // 初始化设置
  if (process.env.COMMIT)  {
    const commit = path.join(APP_ROOT, 'src', 'commit.mjs');
    return cp.spawnSync('node', [commit]); // 提交代码变更
  }

  if (process.env.BUILD) {
    // 构建前端应用程序
    const buildAppPath = path.join(APP_ROOT, 'src', 'build.mjs');
    await cp.spawn(buildAppPath);
    return;
  }

  // 启动http服务(新开子进程)
  httpd = await startHttpd();

  if (process.env.NODE_ENV === 'development') {
    watcher(
      [ 'server', 'schema', 'graphql', 'resolvers', ],
      () => restartHttpd(),
    );
  }

  if (process.env.FORK) httpd.unref();
}

/**
 * show help
 */

Main.prototype.showHelp = function () {
  return fs.createReadStream(HELP_FILE).pipe(process.stdout);
}

/**
 * show version
 */

Main.prototype.showVersion = function () {
  console.log({
    version: APP_VERSION,
    branch:  APP_BRANCH_NAME,
    commit:  APP_BRANCH_VERSION,
  });
}

/**
 * 显示系统信息
 */

Main.prototype.showSysinfo = function () {
  const sysinfo = {
    platform: `${os.platform()}@${os.release()} ${os.arch()}`,
    node_version: process.version,
    node_env: process.env.NODE_ENV,
  };

  console.log(sysinfo);
}

/**
 * Folder watcher
 */

Main.prototype.watcher = function (folders) {
  debug('观察者模式: 监控开发环境下服务端代码变动,并重启后端服务.');
  if ('string' === typeof(folders)) folders = [folders];
  if (!Array.isArray(folders)) throw TypeError('提供的参数必须为数组');

  for (let folder of folders) {
    let changeLog = '';
    let lastTimer = null;
    const options = { persistent: true, recursive: true, encoding: 'utf8' };
    if (!path.isAbsolute(folder)) folder = path.join(APP_ROOT, 'src', folder);

    fs.watch(folder, options, (eventType, filename) => {
      const delay = 3; // 默认3s

      const timeout = setTimeout(() => { 
        restartHttpd();
        lastTimer = null;
      }, delay * 1000);

      const interval = lastTimer ? process.hrtime(lastTimer)[0] : 0;

      // 如果间小于delay,取消重启动作 
      if (lastTimer !== null && interval < delay) {
        clearTimeout(timeout);
      }

      // 重置lastTimer
      lastTimer = process.hrtime();
    });
  }
}

/**
 * spawn a child process.
 *
 */

Main.prototype.startHpptd = async function () {
  const file = `${date.format('yyyymmdd')}_process.log`;
  const log = fs.openSync(path.join(LOG_DIR, file), 'a+');

  const args = [
    '--no-warnings', 
    '--experimental-json-modules',
    `--title=${process.title}.${httpd}`,
    path.join(APP_ROOT, 'src', 'server', 'index.mjs'),
  ].filter(Boolean);

  // options
  const options = {
    cwd: APP_ROOT, // 运行目录
    env: process.env,
    detached: process.env.FORK ? true : false, // 是否独立进程
    stdio: process.env.FORK ? ['ignore', log, log] : [0, 1, 2], 
  };

  // spawn a async process.
  this.httpd = cp.spawn('node', args, options);
}

Main.prototype.restartHttpd = async function () {
  if (null == this.httpd) return;
  this.httpd.kill('SIGHUP'); // 先关闭进程
  console.log('服务重启...');
  this.httpd = await startHttpd();
}

/**
 *
 */

Main.prototype.saveConfig = function () {
  // 写入配置文件
  return fs.promises.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 4));
}

/**
 * 导出数据
 */

Main.prototype.exportCSV = async function (csvFile) {
  if ('string' !== typeof csvFile) return;
  if (!path.isAbsolute(csvFile)) csvFile = path.join(process.cwd(), csvFile);

  const collection = Params.collection;
  if (null == collection || '' === collection) return;

  const cursor = mongodb.collection(collection).find({});

  const data = await cursor.toArray();
  const csv = array(data).toCSV();

  return fs.promises.writeFile(csvFile, csv);
}

/**
 * 导入数据
 */

Main.prototype.importCSV = async function (csvFile) {
  if ('string' !== typeof csvFile) return;
  if (!path.isAbsolute(csvFile)) csvFile = path.join(process.cwd(), csvFile);

  const csv = await fs.promises.readFile(csvFile).catch(err => {
    console.log(err);
    process.exit(); // 读取文件出错时退出进程
  });

  const data = strings.csvToJSON(csv);
  const collection = Params.collection;
  if (null == collection || '' === collection) return;

  return mongodb.collection(collection).insertMany(data).then(res => {
    console.log(res);
  });
}

/**
 *
 * Read from stdin input
 *
 * @param: {string} question
 * @param: {bool} password 是否显示*号代替输入字符 
 *
 */

Main.prototype.readFromInput = function (question, password = false) {

  process.stdout.write(String(question));

  // 从标准输入读入数据
  return new Promise((resolve, reject) => {
    if (process.stdin.isPaused()) process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      const input = String(chunk).trim();
      resolve(input);
      process.stdin.pause();
    });
  });
}

/**
 * check node version
 *
 * @param {number} leastVersion
 *
 */

Main.prototype.checkNodeVersion = function (leastVersion = 12) {
  // major node version must gretter than 12
  if (Number(String(process.version).substr(1, 2)) < leastVersion) {
    console.warn(`当前Node版本:${process.version}, 请升级至最新版本.`);
    process.exit();
  }
}

/**
 * 初始化设置
 */

Main.prototype.setup = async function () {
  // 任务1: 建立符号链接启动脚本
  const task_1 = cp.spawn('ln', [
    '-s', 
    path.join(APP_ROOT, 'bin', 'start.mjs'), 
    path.join(process.env.HOME, '.bin', APP_NAME + 'ctl')
  ]);

  return await Promise.all([
    task_1
  ]);
}

// 执行主程序
new Main().run();
