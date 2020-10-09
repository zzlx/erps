#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * Http Daemon
 *
 * ERP服务后台管理程序(ERP Services Daemon, ERPSD),
 * 用于管理ERP各项服务的启动、关闭、重启等任务.
 *
 * *****************************************************************************
 */

import cluster from 'cluster';
import cp from 'child_process';
import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import path from 'path';
import util from 'util';

import settings from '../config/settings.mjs';
import { 
  assert, 
  argvParser, 
  console 
} from '../src/utils.mjs';
import serviceApp from '../server/main.mjs';

const paths = settings.paths;
const debug = util.debuglog('debug:httpd.mjs');

// 定义存储器
const sessionStore = {};
let httpd = null;
let server = null;

process.title = 'erps.httpd';

process.nextTick(() => {
  // 检测系统平台类型
  // 系统服务依赖于类unix系统环节, 在非unix环境中无法正常提供服务
  assert(getOSPlatform() === 'unix-like', `Run in unix-like platform.`);
  executer()
}); 

/**
 * 根据参数执行命令
 */

function executer () {
  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const paramMap = argvParser(ARGVS);

  // 处理环境变量配置 
  for (let param of paramMap.keys()) { 
    switch(param) { 
      case 'env': 
        settings.env = paramMap.get('env');

        paramMap.delete(param); // delete param key
        continue;
      case 'debug':
        process.env.NODE_DEBUG = 'debug:*';
        paramMap.delete(param); // delete param key
        continue;
      //default:
    }
  }

  if (paramMap.size == 0) {
    console.log('There is nothing to do./@todo: Show help message.');
  }

  for (let param of paramMap.keys()) {
    switch(param) {
      case 'help':
        //showHelp();
        paramMap.delete(param); // delete param key
        break;
      case 'start':
        paramMap.delete(param); // delete param key
        start();
        break;
      case 'stop':
        paramMap.delete(param); // delete param key
        stop();
        break;
      case 'restart':
        paramMap.delete(param); // delete param key
        restart();
        break;
    }

    if (paramMap.size > 0) {
      console.log(`The param you provid is not supported.`);
    }
  }
}

function start () {
  const server = http2.createSecureServer({
    key: settings.privateKey,
    cert: settings.cert,
    allowHTTP1: true,
    //ca: [fs.readFileSync('client-cert.pem')],
    //sigalgs: 
    //ciphers: 
    //clientCertEngine: 
    //dhparam
    //ecdhCurve
    //privateKeyEngine
    passphrase: settings.passphrase,
    //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
    sessionTimeout: 300, // seconds
    handshakeTimeout: 120000, // milliseconds
  });

  attachServerEvent(server);

  const streamHandler = serviceApp.streamHandler();

  server.on('stream', (stream, headers, flags) => {
    debug('new stream event with flags:', flags); // flags: 37
    attachStreamEvents(stream);
    streamHandler(stream, headers, flags);
  });

  server.listen({
    ipv6Only: false, // 是否仅开启IPV6
    host: settings.system.ipv6 ? '::' : '0.0.0.0',
    port: settings.system.port,
    exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
  });
}

function stop () {
  let pid = null;
  const port = settings.system.port;
  if (httpd !== null) pid = httpd.pid;
  else pid = getPidByPort(port);

  if (pid) cp.execSync(`kill -9 ${pid}`);
}

function restart () {
  stop();
  start();
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

function getOSPlatform () {
  let platform = null;

  switch (os.platform()) {
    case 'aix': 
    case 'darwin': 
    case 'freebsd': 
    case 'linux': 
    case 'openbsd': 
    case 'sunos': 
      platform = 'unix-like';
      break;
    case 'win32': 
    case 'win64': 
      platform = 'win';
      break;
    default:
      platform = 'unknown';
  }

  return platform;
}

/**
 * 根据port查询服务进程ID
 *
 * @param {string|number}
 * @return {string} 
 */

function getPidByPort (port) {
  return cp.execSync(`lsof -i:${port} | grep 'LISTEN' \
    | awk \'NR==1{print $2}\'`
  ).toString('utf8');
}

// attach
function attachServerEvent (server) {

  const keylogFile = fs.createWriteStream(path.join(paths.APP_LOG, 'ssl-keys.log'), {flags: 'a+'});

  server.on('keylog', (line, tlsSocket) => {
    debug('keylog event with line:', line.toString());
    keylogFile.write(line);
  });

  server.on('secureConnection', socket => {
    debug('secureConnection event ');
  });

  server.on('newSession', (id, data, cb) => {
    debug('newSession event with sessionId: %s', id.toString('hex'));
    sessionStore[id.toString('hex')] = data;
    cb();
  });

  server.on('OCSPRequest', (certificate, issuer, callback) => {
    debug('OCSPRequest event with certificate: %o, issuer: %o', 
      certificate.toString('hex'),
      issuer,
    );
    callback();
  });

  server.on('resumeSession', (id, cb) => {
    debug('resumeSession event with id: %s', id.toString('hex'));
    cb(null, sessionStore[id.toString('hex')] || null);
  });

  server.on('sessionError', err => {
    debug('sessionError');
  });

  server.on('unknownProtocol', socket => {
    debug('unknownProtocol');
  });

  server.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${err.port} is used, try again later.`);
    }

    debug(err);
  });

  server.on('close', function () {
    debug(this);
  });

  server.on('listening', function () {
    console.clearLine();
    console.log('The %s Server is running on %o.', process.env.NODE_ENV, this.address());
  });

}

function attachStreamEvents (stream) {

  stream.on('aborted', () => {
    debug('Stream is aborted.');
  });

  stream.on('close', () => {
    debug('Stream is closed.');
  });

  stream.on('error', error => {
    debug('Stream error: ', error);
  });

  stream.on('frameError', (err) => {
    debug('Stream frameError: ', err);
  });

  stream.on('ready', () => {
    debug('Stream is ready.');
  });

  stream.on('timeout', () => {
    debug('Stream is timeout.');
  });

  stream.on('trailers', (headers, flags) => {
    debug(headers);
  });

  stream.on('wantTrailers', () => {
    debug('Stream want trailers.');
  });
}
