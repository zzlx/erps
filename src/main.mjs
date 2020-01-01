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
import DBA from '../src/databases/MongoDBA.mjs';
import console from './utils/console.mjs';
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
let httpd = null;
let mongodb = null;
let dba = null;
let Config = {};
const Params = argvParser(process.argv.slice(2)); // 获取并解析命令行参数
const rl = readLine();

process.title = APP_NAME; // 设置进程名称

// 捕获unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 捕获exception
process.on('uncaughtException', (err, origin) => {
  fs.writeSync(
    process.stderr.fd,
    `Caught exception: ${err}\n` +
    `Exception origin: ${origin}`
  );
});

// 进程退出前执行的任务
process.on('beforeExit', (code) => {
  //console.log('Process beforeExit event with code: ', code);
  if (mongodb) mongodb.close(); // 关闭数据链接
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
  fs.createReadStream(HELP_FILE).pipe(process.stdout);
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

function getDB(dbURL) {
  //  
  const url = dbURL 
    ? new URL(dbURL)
    : new URL(Config.mongodb);

  if (Params.user) url.username = Params.user;
  if (Params.pwd) url.password = Params.pwd;
  if (Params.db) url.pathname = Params.db;
  if (null == Params.pwd || null == Params.pwd) { url.password = ''; url.username = ''; }

  dba = new DBA(url.href);
  return dba.client.connect().then(client => { mongodb = client.db(); });
}

/**
 *
 *
 */

async function setupConfig () {
  // 从配置文件中读取配置项目
  const config_file = path.join(APP_HOME, 'config.json');
  const config = await fs.promises.readFile(config_file).catch(e => '{}');
  Config = JSON.parse(config);
  
  if (!Config.mongodb) {
    await new Promise((resolve, reject) => {
      rl.question('未配置数据库，请提供数据库url:', answer => {
        Config.mongodb = new URL(answer).href;
        resolve();
      });
    });
  }

  // 写入配置文件
  await fs.promises.writeFile(config_file, JSON.stringify(Config)).catch(e=>null);
}

/**
 * 导入数据
 */

function importCSV (csvFile) {
  const csv = fs.readFileSync(csvFile);
  const data = strings.csvToJSON(csv);
  const collection = Params.collection;
  if (null == collection || '' === collection) return;

  return mongodb.collection(collection).insertMany(data).then(res => {
    console.log(res);
  });
}

/**
 * 主控制程序 
 *
 * 管理执行顺序及控制逻辑
 */
(async function main () {

  // 设置环境变量
  if (Params.devel || Params.development) process.env.NODE_ENV = 'development'; 
  if (Params.devel && Params.devel === 'ui') {
    process.env.DEVEL_UI = true; 
    process.env.PORT=3001;
  }
  if (Params.port) process.env.PORT = Number.parseInt(Params.port);

  // 执行解析的参数命令
  if (Params.help || Params.h) return showHelp();
  if (Params.version || Params.v) return showVersion();
  if (Params.commit) return commit();

  // 以下任务需要读取本地配置文件,需先检测必要的目录
  // 检测并准备必要的目录
  await readyDir(); 
  await setupConfig();

  // 不需要数据连接的任务
  if (Params.build) return await build();

  // 建立数据连接
  await getDB('mongodb://localhost:27017/yc');

  if (Params.import) {
    if (Params.import && Params.import === true) {
      console.log('请提供导入文件路径');
      process.exit();
    }
    const importFile = path.join(process.cwd(), Params.import);

    importCSV(importFile);
  }

  dba.client.close();
  return;

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

  if (Params.fork) httpd.unref();
})(); // 立即执行main主程序
