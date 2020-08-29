#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 服务启动器
 *
 * 进程执行完即退出
 *
 * *****************************************************************************
 */

import cluster from 'cluster';
import crypto from 'crypto';
import cp from 'child_process';
import os from 'os';
import path from 'path';
import util from 'util';
import zlib from 'zlib';

import { assert, argvParser, } from '../server/utils.mjs';
import config from '../server/config/default.mjs';

// 执行程序
process.nextTick(() => executer()); 

/**
 * *****************************************************************************
 *
 * Utility functions 
 *
 * > ##### 注意:ETags 
 * > 以下为此脚本工具用到的*功能函数* 
 *
 * *****************************************************************************
 */

function getPid () {
  let pid = null;
  let pidFromFile = null;
  let pidFromPort = null;

  if (fs.existsSync(pidFile)) {
    pidFromFile = fs.readFileSync(pidFile, 'utf8');
  }

  // 仅在unix环境下有效
  pidFromPort = cp.execSync(`lsof -i:${config.server.port} | awk \'NR==2{print $2}\'`).toString('utf8');

  if (pidFromPort) pid = pidFromPort

  return pid;
}

function restart () {
  debug('%s is restarting...', process.title);
  if (getPid() == '' || getPid() == null) {
    console.log(`${process.title} is not started, use '--start' have a try.`);
    start();
    return;
  }

  stop();
  start();
}

function stop () {
  if (http2server == null) {
    // check pid process
    const pid = getPid();
    if (pid) cp.execSync(`kill -9 ${pid}`);
    return;
  }

  http2server.close(() => {
    debug('Server is closed.');

  });
}

async function start () {

  // Task1: 构建styles.css
  // 启动时均重建styles.css文件,以保证代码最新
  await import(path.join(config.paths.appRoot, 'server', 'sass.mjs'))
    .then(m => m.default)
    .then(sass => sass());

  // Task2: 生成index.html文件
  await new Promise((resolve, reject) => {
    const html = new HTMLRender().setTitle('Home').render();

    fs.promises.writeFile(path.join(paths.public, 'index.html'), html).then(()=> {
      resolve();
    }).catch(err => { reject(err); });
  });

  // Task3: 拷贝react、react-dom
  await Promise.all([
    fs.promises.copyFile(
      path.join(
        paths.nodeModules, 
        'react-dom', 
        'umd', 
        `react-dom.${config.env === 'development' ? 'development' : 'production.min'}.js`),
      path.join(
        paths.public, 
        'statics', 
        `react-dom.${config.env === 'development' ? 'development' : 'production.min'}.js`),
    ), 
    fs.promises.copyFile(
      path.join(
        paths.nodeModules, 
        'react', 
        'umd', 
        `react.${config.env === 'development' ? 'development' : 'production.min'}.js`),
      path.join(
        paths.public, 
        'statics', 
        `react.${config.env === 'development' ? 'development' : 'production.min'}.js`),
    ), 
  ]);

  // after the server started successfully, record pid to pidfile.
  http2server.on('listening', function () {
    recordPid().catch((err) => debug(err));
  });

  http2server.listen({
    ipv6Only: false, // 是否仅开启IPV6
    host: config.server.host,
    port: config.server.port,
    exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
  });

}

function executer () {
  // Task: Parse argvs
  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const paramMap = argvParser(ARGVS);

  // 
  for (let param of paramMap.keys()) { 
    switch(param) { 
      case 'env': 
        config.env = paramMap.get('env');
        process.env.NODE_ENV = config.env;

        paramMap.delete(param); // delete param key
        continue;
      case 'debug':
        process.env.NODE_DEBUG = 'debug:*';
        paramMap.delete(param); // delete param key
        continue;
      //default:
    }
  }

  if (paramMap.size == 0) console.log('There is nothing to do.');

  // execute tasks
  for (let param of paramMap.keys()) {
    switch(param) {
      case 'help':
        //showHelp();
        paramMap.delete(param); // delete param key
        break;
      case 'stop':
        paramMap.delete(param); // delete param key
        stop();
        break;
      case 'start':
        paramMap.delete(param); // delete param key
        start();
        break;
      case 'restart':
        paramMap.delete(param); // delete param key
        restart();
        break;
      case 'watcher':
        paramMap.delete(param); // delete param key
        watcher();
        break;
    }

    if (paramMap.size > 0) {
      console.log(`The param you provid is not supported.`);
    }
  }
}

function watcher () {
  console.log('开启监听...');
  watchPath(
    path.join(paths.appRoot, 'server'),
    path.join(paths.appRoot, 'styles'),
    () => {
      console.log('重启服务');
      restart();
    }
  );
}

function createServer () {
  const server =  http2.createSecureServer({
    key: fs.readFileSync(`/etc/ssl/${os.hostname()}-key.pem`),
    cert: fs.readFileSync(`/etc/ssl/${os.hostname()}-cert.pem`),
    allowHTTP1: true,
    //ca: [fs.readFileSync('client-cert.pem')],
    //sigalgs: 
    //ciphers: 
    //clientCertEngine: 
    //dhparam
    //ecdhCurve
    //privateKeyEngine
    //passphrase: 'sample',
    //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
  }).on('listening', function () {
    // listening event 

    console.log('Server is running on adress: %o', this.address());

  }).on('error', function(err) {
    // error event 

    debug(this);

    if (err.code === 'EADDRINUSE') {
      console.info(`Address ${err.address}:${err.port} is in use, try again later.`)
    }
  }).on('stream', app.callback());


  return server;
}

function useCluster () {
  const numCPUs = os.cpus().length;

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    // 使用一半cpu执行任务
    for (let i = 0; i < Math.round(numCPUs/2); i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });

  } else {

    console.log(`Worker ${process.pid} started`);
  }
}

function generateStyles () {
  const paths = config.paths;
  // Task1: 构建styles.css
  // 启动时均重建styles.css文件,以保证代码最新
  return import('node-sass').then(m => m.default).then(sass => {
    sass.render({
      file: config.paths.scssEntryPoint,
      outputStyle: config.env === 'production' ? 'compressed': 'nested',
    }, (err, result) => {
      if (err) reject(err);

      Promise.all([
        fs.promises.writeFile(paths.stylesCss, result.css),
        fs.promises.writeFile(paths.stylesCss + '.br', zlib.brotliCompressSync(result.css)),
      ]);

      resolve();
    });
  });
}
