import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn, execSync, } from 'child_process'; 
import webpack from 'webpack';

import dotenv from './utils/dotenv.mjs';
import ISODate from './utils/date.mjs';
import DBA from '../src/databases/MongoDBA.mjs';
import console from './utils/console.mjs';
import argvParser from './utils/argvParser.mjs';
import PackageJSON from '../package.json';
import * as Fns from '../src/queries/index.mjs';

const dsn = () => ISODate.toLocaleISOString().substr(0,10).replace(/[-\/]/g, '');
const __dirname = path.dirname(import.meta.url.substr(7));  // 获取当前所在目录
const ROOT = path.dirname(__dirname); // 定位程序根目录
const envFile = path.join(ROOT, '.env');
const dotEnvConfig = dotenv(envFile);
for (let key of Object.keys(dotEnvConfig)) {
  if (process.env[key]) continue;
  process.env[key] = dotEnvConfig[key];
}

// 设置变量
let httpd = null;

process.title = String(PackageJSON.name); // 设置进程名称
process.chdir(ROOT); // 定位进程工作目录

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
});

process.on('exit', (code) => {
  //console.log('Process exit event with code: ', code);
});

/**
 * show help
 */

function showHelp() {
  const helpFile = path.join(ROOT, 'src', 'help.txt');
  const help = fs.readFileSync(helpFile, 'utf8');
  process.stdout.write(help);
  process.exit();
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
  process.exit();
}

/**
 * show version
 */

function showVersion() {
  const version = PackageJSON.version; 
  const gitVersion = fs.readFileSync(path.join(ROOT, '.git/refs/heads/devel'));

  process.stdout.write(`version: ${version}\ncommit-hash: ${gitVersion}`);

  process.exit();
}

/**
 * build前端
 *
 */

function build () { 
  const configFile = path.join(ROOT, 'src', 'webpack.config.cjs');
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

function interactiveMode () {

  // Interactive mode.
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });
  rl.prompt();
  rl.on('line', (line) => {
    switch (line.trim()) {
      case 'version':
        emit('showVersion');
        break;
      case 'help':
        emit('showHelp');
        break;
      case 'devel':
        emit('start');
        break;
      case 'start':
        emit('start');
        break;
      case 'exit':
        rl.emit('close'); // emit close event.
        break;
      default:
        console.log(`Command '${line.trim()}' is not supported.`);
        break;
    }
    rl.prompt();
  }).on('close', () => {
    console.log('交互模式已退出!');
    process.exit(0);
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

  const log_file = path.join(
    process.env.HOME, 
    `.${PackageJSON.name}`, 
    `${dsn()}_process.log`
  ); 

  const log = fs.openSync(log_file, 'a+');

  // args
  const args = [
    //'--experimental-modules',
    '--experimental-json-modules',
    //'--no-warnings',
    `--title=${process.title}.httpd`,
    path.join(ROOT, 'src', 'server', 'http-server.mjs'),
  ];

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
 * readyDir
 *
 */
function readyDir () {
  // 执行准备工作
  const profilePath = path.join(process.env.HOME, `.${PackageJSON.name}`);
  const configFile = path.join(profilePath, 'conf.json');
  const defaultConf = path.join(ROOT, 'src', 'default.config.json');

  const asyncTasks = [
    fs.promises.mkdir(profilePath, {recursive: true}), // 确保文件夹存在
    new Promise((resolve, reject) => {
				if (!fs.existsSync(configFile)) {
						fs.copyFileSync(defaultConf, configFile);
				}
				resolve(true);
    }),
  ];

  // 等待准备工作完成后再进行下一步工作
  return Promise.all(asyncTasks);
}

/**
 *
 *
 */
async function dba(Params) {

  const url = `mongodb://${Params.user || ''}${Params.pwd ? ':' + Params.pwd: ''}${Params.user ?'@': ''}localhost:27017/yc`;
  const dba = new DBA(url);

  // 关闭数据库链接 
  process.nextTick(() => { dba.client.close(); });
  const db = await dba.client.connect().then(client => client.db());

  if (Fns[Params.run]) { 
    await Fns[Params.run].apply({db, Params});
  }
}

/**
 * 主程序
 */

(async function main () {
  const Params = argvParser(process.argv.slice(2)); // 获取脚本启动参数

  // 设置port
  process.env.PORT = Params.port || 3000;
  if (Params.devel) { process.env.DEVEL = true; }

  // set environment
  process.env.NODE_ENV = /^devel(opment)?/.test(Params.env) 
    ? 'development' 
    : 'production';

  if (Params.help || Params.h) showHelp();
  if (Params.version || Params.v) showVersion();
  if (Params.commit) commit();

  await readyDir(); // 检测并准备必要的目录

  if (Params.build) return await build();
  if (Params.run) return await dba(Params); 

  startHttpd(Params);

  if (process.env.NODE_ENV === 'development' && !process.env.DEVEL) {
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
})();
