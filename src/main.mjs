/**
 * 主程序
 *
 * 用于初始化系统环境及系统服务启动
 *
 * @file: main.mjs
 */

/******************************************************************************/

// node内置模块
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn, execSync, } from 'child_process'; 

// 第三方模块
import webpack from 'webpack'; // webpack模块

// 代码库模块
import ISODate from './utils/date.mjs';
import MongoDB from './utils/mongodb.mjs';
import console from './utils/console.mjs';
import array from './utils/array.mjs';
import date from './utils/date.mjs';
import argvParser from './utils/argvParser.mjs';
import strings from './utils/strings.mjs';
import * as Fns from '../src/queries/index.mjs';
import './config.env.mjs';
import { 
  APP_ROOT as ROOT, 
  APP_NAME,
  APP_HOME,
  APP_VERSION,
  APP_BRANCH,
  APP_BRANCH_VERSION,
  HELP_FILE,
  DOT_ENV_FILE,
} from './config.common.mjs';

const dsn = () => ISODate.toLocaleISOString().substr(0,10).replace(/[-\/]/g, '');

// 设置主程序模块全局变量
const dba = new MongoDB();
let httpd = null;
const config_file = path.join(APP_HOME, 'config.json');
let Config = null;
const Params = argvParser(process.argv.slice(2)); // 获取并解析命令行参数

/**
 *
 */

function readConfig () {
  return fs.promises.readFile(config_file)
    .then(config => Config = JSON.parse(config))
    .catch(e => console.log(e));
}

//测试argvParser
//console.log(Params);
//process.exit(); 

process.title = APP_NAME; // 设置进程名称

// 捕获unhandled rejection
process.on('unhandledRejection', async (reason, promise) => {

  console.log('捕获到Rejection:', promise, '\nReason:', reason);

  if (reason.codeName === 'Unauthorized' && reason.code === 13) {
    Params.user = await readFromInput('请输入数据库用户名:');
    Params.pwd = await readFromInput('请输入密码:'); 
    await saveConfig(); // 保存一下配置文件
    await main();
  }

  process.exit();
  //if (mongodb) mongodb.close(); // 关闭数据链接
});

// 捕获exception
process.on('uncaughtException', (err, origin) => {
  fs.writeSync(
    process.stderr.fd,
    `Caught exception: ${err}\n` +
    `Exception origin: ${origin}`
  );

  //if (null !== mongodb) mongodb.client.close(); // 关闭数据链接
  process.exit();
});

// 进程退出前执行的任务
process.on('beforeExit', (code) => {
  //console.log('Process beforeExit event with code: ', code);
  //if (mongodb) mongodb.close(); // 关闭数据链接
});

process.on('exit', (code) => {
  if (process.env.NODE_ENV !== 'development') return; // 仅在开发模式下显示退出状态

  const status = {
    'exitCode': code,
    uptime: process.uptime(),
  };

  console.log('Process status: %o', status);
});

/**
 * show help
 */

function showHelp() {
  return fs.createReadStream(HELP_FILE).pipe(process.stdout);
}

/**
 * commit and push
 */

function commit() {
  process.stdout.write('准备提交变更...')
  console.log('暂存变更...');
  execSync(`git -C ${ROOT} add -A .`, {encoding: 'utf8'});

  console.log('检查变更...');

  //const diff = execSync(`git -C ${ROOT} diff --staged --quiet`, { encoding: 'utf8', });

  console.log('提交变更...');
  execSync(`git -C ${ROOT} commit -m "自动提交"`, {encoding: 'utf8'});

  console.log('同步远程仓库...');
}

/**
 * show version
 */

function showVersion() {
  process.stdout.write(`version: ${APP_VERSION}\n${APP_BRANCH}: ${APP_BRANCH_VERSION}`);
}

/**
 * build
 * 构建并打包前端应用程序
 */

function build () { 
  const configFile = path.join(ROOT, 'src', 'config.webpack.cjs');
  return import(configFile).then(module => {
    const webpackConfig = module.default;
    const compiler = webpack(webpackConfig());

    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
      }

      console.log(stats.toString({
        chunks: false,
        colors: true,
      }));
    });
  });
}

/**
 * 交互模式
 *
 */

function readLine () {
  const rl = readLine();
  // Interactive mode.
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });
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
  const log_file = path.join(APP_HOME, 'log', `${dsn()}_process.log`); 
  const log = fs.openSync(log_file, 'a+');

  // args
  const args = [
    //'--experimental-modules',
    '--experimental-json-modules',
    process.env.NODE_ENV !== 'development' && '--no-warnings', // 仅在开发模式下显示warning
    `--title=${process.title}.httpd`,
    path.join(ROOT, 'src', 'server', 'httpd.mjs'),
  ].filter(Boolean);

  // options
  const options = {
    env: process.env,
    detached: opts.fork ? true : false, // 是否独立进程
    stdio: opts.fork ? ['ignore', log, log] : 'inherit', 
  };

  // spawn a async process.
  httpd = spawn('node', args, options);
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
    fs.promises.mkdir(path.join(APP_HOME, 'log'), {recursive: true}),
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
  return fs.promises.writeFile(config_file, JSON.stringify(Config))
    .catch(e => console.log(e));
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
 * 设置环境变量
 */

function setEnvironment () {
  if (Params.devel || Params.development) process.env.NODE_ENV = 'development'; 
  if (Params.devel && Params.devel === 'ui') {
    process.env.DEVEL_UI = true; 
    process.env.PORT=3001;
  }

  if (Params.port) process.env.PORT = Number.parseInt(Params.port);

}

/**
 * 从标准输入读取内容
 */

function readFromInput (question) {
  process.stdout.write(String(question));

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
 * 主控制程序 
 *
 * 管理执行顺序及控制逻辑
 */
async function main () {

  // 读入配置项目 
  await readConfig();

  // 设置环境变量
  setEnvironment();
  
  // 执行解析的参数命令
  if (Params.help || Params.h) return await showHelp();       // 显示帮助文件
  if (Params.version || Params.v) return await showVersion(); // 显示版本号
  if (Params.commit) return await commit();                   // 提交代码变更

  // 以下任务需要读取本地配置文件,需先检测必要的目录
  // 检测并准备必要的目录
  await readyDir();    // 准备目录

  // 不需要数据连接的任务
  if (Params.build) return await build();

  // 建立数据连接
  const url = new URL(Config.mongodb);
  if (Params.user && Params.pwd) {
    url.username = Params.user;
    url.password = Params.pwd;
    Config.mongodb = url.href;
    await saveConfig();
  } 

  await dba.connect(url.href).catch(err => {
    if(err.name === 'MongoNetworkError') {
      process.stdout.write('mongodb服务器网络错误\n'); 
      process.stdout.write('请确认mongod服务已启动'); 
      process.exit();
    }
  });

  //const user = await readFromInput('请输入用户名:');
  //const pwd = await readFromInput('请输入密码:');

  if (Params.import) {
    await importCSV(Params.import);
  }

  if (Params.export) {
    await exportCSV(Params.export);
    await dba.client.close();
  }

  if (Params.query) {
    const fn = Fns[Params.query] 
      ? Fns[Params.query]
      : () => {}; 

    await fn.apply({ db: dba.db, params: Params, });
    await dba.client.close();
  }

  if (Params.httpd) {
    // 需要数据连接的任务
    startHttpd(Params);

    if (process.env.NODE_ENV === 'development' && !process.env.DEVEL_UI) {
      watcher([
        path.join(ROOT, 'src', 'server'), 
        path.join(ROOT, 'src', 'schema'), 
        path.join(ROOT, 'src', 'graphql'), 
        path.join(ROOT, 'src', 'resolvers'), 
      ], () => {
        restartHttpd(Params);
      });
    }
  }

  if (Params.fork) httpd.unref();

  process.exit(); // 退出进程
}

main(); // 立即执行main主程序
