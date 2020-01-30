/**
 * 主程序
 *
 * 任务:
 * 1. 初始化运行环境
 * 2. 解析命令行参数,并执行相应配置功能
 * 3. 管理系统服务
 *
 * @file: main.mjs
 */

/******************************************************************************/
// node内置模块
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import cp from 'child_process'; 

// 模块
import './env.mjs'; // 导入环境变量
import { 
  APP_ROOT,
  APP_NAME,
  APP_HOME,
  APP_LOG_PATH,
  APP_VERSION,
  APP_BRANCH,
  APP_BRANCH_VERSION,
  PUBLIC_HTML,
  HELP_FILE,
  CONFIG_FILE,
} from './config.mjs';

import MongoDB from './utils/mongodb.mjs';
import console from './utils/console.mjs';
import array from './utils/arrayUtils.mjs';
import date from './utils/date.mjs';
import argvParser from './utils/argvParser.mjs';
import strings from './utils/strings.mjs';

let dba = null; // 设置全局变量dba
let httpd = null; // httpd服务 
main(); // 执行main主程序

/******************************************************************************/

/**
 * 执行逻辑
 *
 * 管理执行顺序及控制逻辑
 */

async function main () {
  // 配置进程管理逻辑
  processSetting();

  // 获取并解析命令行参数
  const Params = argvParser(process.argv.slice(2)); 

  // 根据命令行参数设置环境变量
  if (Params.devel || Params.development) process.env.NODE_ENV = 'development'; 
  if (Params.port || (Params.p && Params.p !== true)) {
    process.env.PORT = Number.parseInt(Params.port);
  }

  if (Params.devel && Params.devel === 'ui') {
    process.env.DEVEL_UI = true; 
    process.env.PORT=3001;
  }

  // 执行解析的参数命令
  //
  if (Params.help || Params.h) {
    return await showHelp(); // 显示帮助文件
  }

  if (Params.version || Params.v) {
    return await showVersion(); // 显示版本号
  }

  if (Params.sysinfo) {
    return await showSysinfo(); // 显示系统信息
  }

  if (Params.commit) {
    return await commit(); // 提交代码变更
  }

  if (Params.build) {
    return await build(); // 构建前端应用程序
  }

  // 以下任务需要读取本地配置文件,需先检测必要的目录
  // 检测并准备必要的目录
  await readyDir();

  // 读入配置项目 
  const Config = await getConfig();

  const url = new URL(Config.mongodb);

  if (Params.user && Params.pwd) {
    url.username = Params.user;
    url.password = Params.pwd;
    Config.mongodb = url.href;
    await saveConfig();
  } 

  dba = new MongoDB(url.href);
  await dba.connect();

  if (Params.import) { await importCSV(Params.import); }
  if (Params.export) { await exportCSV(Params.export); }

  if (Params.query) {
    const fn = Fns[Params.query] ? Fns[Params.query] : () => {}; 
    await fn.apply({ db: dba.db, params: Params, });
    await dba.client.close();
  }

  if (Params.httpd) {
    // 需要数据连接的任务
    startHttpd(Params);

    if (process.env.NODE_ENV === 'development' && !process.env.DEVEL_UI) {
      watcher([ 'services', 'server', 'schema', 'graphql', 'resolvers', ], () => {
        restartHttpd(Params);
      });
    }
  }

  if (Params.fork) httpd.unref();

  // 执行到此步骤,关闭数据库连接
  if (dba.client) dba.client.close();

}

/**
 * 管理config配置项目
 */

function getConfig () {
  let Config = null;

  return fs.promises.readFile(CONFIG_FILE, {flag: 'r+'}).then(config => {
    Config = JSON.parse(config)
    if (Config.mongodb == null) {
      Config.mongodb = 'mongodb://localhost:27017/test';
    }

    return Config;
  }).catch(e => {
    if (e.code === 'ENOENT') {
      const file = e.path;

      if (Config.mongodb == null) {
        Config.mongodb = 'mongodb://localhost:27017/test';
      }

      return Config;
    }
  });
}

/**
 * 关闭数据连接
 */

function closeDB () {
    if (dba && dba.client) dba.client.close();
}

/**
 * 进程配置项
 */

function processSetting () {
  process.title = APP_NAME; // 设置进程名称

  // 进程退出前执行的任务
  process.on('beforeExit', (code) => {
    //console.log('Process beforeExit event with code: ', code);
    closeDB(); // 关闭数据链接
  });

  process.on('exit', (code) => {
    closeDB(); // 关闭数据链接
  });

  // 捕获unhandled rejection
  process.on('unhandledRejection', async (reason, promise) => {

    console.log('捕获到Rejection:', promise);

    if (reason.codeName === 'Unauthorized' && reason.code === 13) {
      Params.user = await readFromInput('请输入数据库用户名:');
      Params.pwd = await readFromInput('请输入密码:'); 
      await saveConfig(); // 保存一下配置文件
      await main();
    }

    closeDB(); // 关闭数据链接
  });

  // 捕获exception
  process.on('uncaughtException', (err, origin) => {
    console.log(err);

    fs.writeSync(
      process.stderr.fd,
      `Caught exception: ${err}\n` +
      `Exception origin: ${origin}`
    );

    closeDB(); // 关闭数据链接
  });

}

/**
 * show help
 */

function showHelp() {
  return fs.createReadStream(HELP_FILE).pipe(process.stdout);
}

/**
 * commit and push
 */

async function commit () {
  process.stdout.write('准备提交变更...')
  console.log('暂存变更...');
  cp.execSync(`git -C ${APP_ROOT} add -A .`, {encoding: 'utf8'});

  console.log('检查变更...');

  //const diff = execSync(`git -C ${APP_ROOT} diff --staged --quiet`, { encoding: 'utf8', });

  console.log('提交变更...');
  cp.execSync(`git -C ${APP_ROOT} commit -m "自动提交"`, {encoding: 'utf8'});

  console.log('同步远程仓库...');
}

/**
 * show version
 */

function showVersion () {
  const version = {
    version: APP_VERSION,
    branch:  APP_BRANCH,
    commit:  APP_BRANCH_VERSION,
  }

  console.log(version);
}

/**
 * 显示系统信息
 */
function showSysinfo () {
  const sysinfo = {
    platform: `${process.arch} (${os.platform()} ${os.release()})`,
    node_env: process.env.NODE_ENV,
    node_version: process.version,
  };

  console.log(sysinfo);
}

/**
 * Folder watcher
 */

function watcher (folders, cb) {
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
        cb();
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
 * Start https.
 */

function startHttpd (opts) {
  const log_file = path.join(APP_HOME, 'log', `${date.format('yyyymmdd')}_process.log`); 
  const log = fs.openSync(log_file, 'a+');

  // args
  const args = [
    //'--experimental-modules',
    '--experimental-json-modules',
    process.env.NODE_ENV !== 'development' && '--no-warnings', // 仅在开发模式下显示warning
    `--title=${process.title}.httpd`,
    path.join(APP_ROOT, 'src', 'server', 'httpd.mjs'),
  ].filter(Boolean);

  // options
  const options = {
    env: process.env,
    detached: opts.fork ? true : false, // 是否独立进程
    stdio: opts.fork ? ['ignore', log, log] : 'inherit', 
  };

  // spawn a async process.
  httpd = cp.spawn('node', args, options);
  return httpd;
}

function restartHttpd(Params) {
  if (null == httpd) return;
  httpd.kill('SIGHUP'); // 先关闭进程
  console.log('服务已重启');
  httpd = startHttpd(Params);
}

/**
 * 准备工作
 *
 */
function readyDir () {
  // 执行准备工作
  const asyncTasks = [
    fs.promises.mkdir(APP_HOME, {recursive: true}),
    fs.promises.mkdir(APP_LOG_PATH, {recursive: true}),
    fs.promises.mkdir(PUBLIC_HTML, {recursive: true}),
  ];

  // 等待准备工作完成后再进行下一步工作
  return Promise.all(asyncTasks);
}

/**
 *
 *
 */

function saveConfig () {
  // 写入配置文件
  return fs.promises.writeFile(CONFIG_FILE, JSON.stringify(Config)).catch(e => {
    console.log(e)
  });
}

/**
 *
 *
 */

async function exportCSV (csvFile) {

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

async function importCSV (csvFile) {
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
 * 从标准输入读取内容
 *
 * @param: {string} question
 * @param: {bool} password 是否显示*号代替输入字符 
 *
 */

function readFromInput (question, password = false) {
  process.stdout.write(String(question));

  // 开始从标准输入读入数据
  return new Promise((resolve, reject) => {
    if (process.stdin.isPaused()) process.stdin.resume();
    process.stdin.setEncoding('utf8');

    /*
    process.stdin.on('readable', () => {
      let chunk = null;
      while((chunk = process.stdin.read()) !== null) {
         process.stdout.write(`data: ${chunk}`);
      }

    });
    */

    process.stdin.on('data', (chunk) => {
      const input = String(chunk).trim();
      resolve(input);
      process.stdin.pause();
    });
  });
}

/**
 * build
 * 打包构建前端应用程序
 */

async function build () {
  const webpack = await import('webpack').then(m => m.default);
  if (null == webpack) {
    throw new Error('请执行`npm install --save-dev webpack`安装webpack');
  }
  const config  = await import('./webpack.config.cjs').then(m => m.default);
  const compiler = webpack(config());
  compiler.run(callback);

  // callback function 
  function callback (err, stats) {
    // Error handler
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) console.error(info.errors);
    if (stats.hasWarnings()) console.warn(info.warnings);

    console.log(stats.toString({chunks: false, colors: true}));
    //console.log(stats.toJson({ assets: false, hash: true }));
  }
}
