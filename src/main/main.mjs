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
// Node内置模块
import crypto from 'crypto';
import cp from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// 本地模块
import '../env.mjs'; // 导入环境变量
import { 
  APP_ROOT,
  APP_NAME,
  APP_HOME,
  APP_LOG_PATH,
  APP_VERSION,
  APP_BRANCH_NAME,
  APP_BRANCH_VERSION,
  PUBLIC_HTML,
  RECOMMEND_NODE_VERSION,
  HELP_FILE,
  CONFIG_FILE,
  CONFIG,
} from '../config.mjs';
import MongoDB from '../utils/mongodb.mjs';
import console from '../utils/console.mjs';
import array from '../utils/arrayUtils.mjs';
import date from '../utils/date.mjs';
import strings from '../utils/strings.mjs';

let dba = null; // 设置全局变量dba
let httpd = null; // httpd服务 
let compiler = null; // compiler

// 检测node version
checkNodeVersion();

// 配置进程逻辑
processSetting();

// 执行main主程序,捕获exception.
main();

/******************************************************************************/

/**
 * 主程序逻辑
 *
 * 管理执行顺序及控制启动项目
 */

async function main () {
  // 执行解析的参数命令
  if (process.env.HELP || process.env.H) return showHelp(); // 显示帮助文件
  if (process.env.SYSINFO) return showSysinfo(); // 显示系统信息
  if (process.env.SETUP) return setup(); // 初始化设置
  if (process.env.COMMIT) return commit(); // 提交代码变更
  if (process.env.VERSION || process.env.V) return showVersion(); // 显示版本号
  if (process.env.EXPORT) {
  }

  // 以下任务需要读取本地配置文件,需先检测必要的目录
  // 检测并准备必要的目录
  await readyDir();

  if (process.env.IMPORT) { await importCSV(process.env.IMPORT); }
  if (process.env.EXPORT) { await exportCSV(process.env.EXPORT); }

  if (null == CONFIG.mongodb) {
    CONFIG.mongodb = await readFromInput('请提供mongodb URL:'); 
  }

  const url = new URL(CONFIG.mongodb);

  if (null == url.username) {
    url.username = await readFromInput('请输入用户名:'); 
  } 

  if (null == url.password) {
    url.password = await readFromInput('请输入密码:'); 
  }

  CONFIG.mongodb = url.href;

  // 存储配置
  await saveConfig();

  dba = new MongoDB(url.href);
  await dba.connect();

  if (process.env.QUERY) {
    const fn = Fns[process.env.QUERY] 
      ? Fns[process.env.QUERY] : () => {}; 
    await fn.apply({ db: dba.db, params: Params, });
    await dba.client.close();
  }

  if (process.env.HTTPD) {
    // 需要数据连接的任务
    compiler = await startCompiler();
    httpd = await startHttpd();

    if (process.env.NODE_ENV === 'development') {
      watcher(
        [ 'services', 'schema', 'graphql', 'resolvers', ], 
        () => { return restartHttpd(); }
      );
    }
  }

  if (process.env.FORK) httpd.unref();

  // 执行到此步骤,关闭数据库连接
  if (dba.client) dba.client.close();

}

/**
 * 关闭数据连接
 */

function closeDB () {
    if (dba && dba.client) dba.client.close();
}

/**
 * 进程管理配置项
 */

function processSetting () {
  process.title = APP_NAME; // 设置进程名称

  // 捕获unhandled rejection
  process.on('unhandledRejection', async (reason, promise) => {

    console.log('捕获到Rejection:', promise);

    if (reason.codeName === 'Unauthorized' && reason.code === 13) {
      //Params.user = await readFromInput('请输入数据库用户名:');
      //Params.pwd = await readFromInput('请输入密码:'); 
      //await saveConfig(); // 保存一下配置文件
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

  // 进程退出前执行的任务
  process.on('beforeExit', (code) => {
    //console.log('Process beforeExit event with code: ', code);
    closeDB(); // 关闭数据链接
  });

  process.on('exit', (code) => {
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
    branch:  APP_BRANCH_NAME,
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
 *
 */

function () {
}

/**
 * spawn a child process.
 *
 */

async function spawn (app) {
  const title = path.parse(app).name;
  const file = `${date.format('yyyymmdd')}_process.log`;
  const log_file = path.join(APP_HOME, 'log', file); 
  const log = fs.openSync(log_file, 'a+');

  const args = [
    '--experimental-json-modules',
    // 仅在开发模式下显示warning
    process.env.NODE_ENV !== 'development' && '--no-warnings', 
    `--title=${process.title}.${title}`,
    app,
  ].filter(Boolean);

  // options
  const options = {
    cwd: APP_ROOT, // 运行目录
    env: process.env,
    detached: process.env.FORK ? true : false, // 是否独立进程
    stdio: process.env.FORK ? ['ignore', log, log] : [0, 1, 2, 'ipc'], 
  };

  // spawn a async process.
  return cp.spawn('node', args, options);
}

/**
 *
 */

function startCompiler() {
  return spawn(path.join(APP_ROOT, 'src', 'compiler.mjs'));
}

/**
 *
 */

function startHttpd() {
  return spawn(path.join(APP_ROOT, 'src', 'httpd.mjs'));
}

async function restartHttpd() {
  if (null == httpd) return;
  httpd.kill('SIGHUP'); // 先关闭进程
  console.log('服务已重启');
  httpd = await startHttpd();
}

/**
 * 准备工作目录
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
 */

function saveConfig () {
  // 写入配置文件
  return fs.promises.writeFile( CONFIG_FILE, JSON.stringify(CONFIG, null, 4));
}

/**
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
 * check the recommend node version
 */

function checkNodeVersion (atleastVersion = RECOMMEND_NODE_VERSION) {
  // major node version must gretter than 12
  if (Number(String(process.version).substr(1, 2)) < atleastVersion) {
    console.warn(`当前Node版本:${process.version}, 推荐升级至最新版本.`);
  }
}

/**
 * 初始化设置
 */

async function setup () {
  const cp = await import('child_process');

  // 任务1: 建立符号链接启动脚本
  await cp.spawn('ln', [
    '-s', 
    path.join(APP_ROOT, 'start.mjs'), 
    path.join(process.env.HOME, '.bin', APP_NAME + 'ctl')
  ]);
}
