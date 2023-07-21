/**
 * *****************************************************************************
 * 
 * HTTP Daemon
 *
 * ## Features:
 * * http2
 * * 支持Cluster集群 
 * * 支持websocket socket
 *
 * *****************************************************************************
 */

import cluster from "cluster";
import fs from "fs";
import http2 from "node:http2";
import os from "os";
import path from "path";
import process from "node:process";
import util from "util";
import { app } from "./app.mjs";
import { system, configs } from "./settings/index.mjs";
import { Websocket } from "./utils/Websocket.mjs";
import { capitalize, isMac } from "./utils/index.mjs";

const debug = util.debuglog("debug:http2d");
const url = import.meta.url;

let server;

process.title = "org.zzlx." + path.basename(url, path.extname(url));

process.on("exit", (code) => {
  debug(`${process.title} is exit with exitCode: ${code}`);
});

process.on("uncaughtException", (error, origin) => {
  debug("The uncaughted exception: ", error);
  debug("The origin uncaught exception: ", origin);
});

process.on("unhandledRejection", (reason, promise) => {
  debug(
    "Rejection is come from ", 
    promise, 
    " because of: ", 
    reason,
  );
});


// 配置进程名称

// 启用cluster
if (cluster.isPrimary && process.env.NODE_ENV !== "development") {
  // Keep track of requests
  let numReqs = 0;

  // Fork workers.
  // @todo: 监控server负载及系统资源使用情况
  // @todo: 研究如何根据server负载及系统资源情况决定新建worker的算法
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) { 
    cluster.fork(process.env);
  }

  for (const id in cluster.workers) {

    const worker = cluster.workers[id];

    worker.on("message", msg => {
      if (msg.cmd && msg.cmd === "notifyRequest") {
        numReqs += 1;
        debug("requests", numReqs);
      }
    });

    worker.on("exit", (code, signal) => {
      if (signal) {
        debug(`worker was killed by signal: ${signal}`);
      } else if (code !== 0) {
        debug(`worker exited with error code: ${code}`);
      } else {
        debug("worker success!");
      }
    });
  }

  cluster.on("exit", (worker, code, signal) => {
    if (worker.exitedAfterDisconnect === true) {
      debug("Oh, it was just voluntary – no need to worry");
    }

    debug(`(pid:${worker.process.pid})Worker process died`);
  });

} else {

  // 初始化服务器:
  server = http2.createSecureServer({
    allowHTTP1: true,
    //ca: [fs.readFileSync("client-cert.pem")],
    key: fs.readFileSync(configs.privateKey),
    cert: fs.readFileSync(configs.cert), // use fullchain as cert
    passphrase: configs.passphrase,
    requestCert: false, // 客户端证书支持
    rejectUnauthorized: false,
    //sigalgs: 
    //ciphers: 
    //clientCertEngine: 
    //dhparam
    //ecdhCurve
    //origins: [],
    //privateKeyEngine
    //pfx: fs.readFileSync("etc/ssl/localhost_cert.pfx"),
    //ticketKeys: crypto.randomBytes(48), 
    handshakeTimeout: 120 * 1000, // milliseconds
    sessionTimeout: 300, // seconds
  });

  server.on("error", e => {

    if (e.code === "EADDRINUSE") { 
      if (process.send) {
        process.send(e);
      } else {
        // debug(`${process.title} is already runing on ${e.address}:${e.port}, try again later`);
        debug(
          "%s is already running on port %s, try again later.",
          capitalize(process.title),
          e.port,
        );
      }

      if (isMac()) {
        //cp.exec(`lsof -i:${e.port} |xargs killall`);
      }

    } else {
      debug(e); // 打印错误信息
    }

  });

  // stream handler
  // (stream, headers) => {}
  //
  server.on("stream", app.callback());

  // Websocket support
  const ws = new Websocket({ server: server, });

  // he "secureConnection" event is emitted after the handshaking process 
  // for a new connection has successfully completed. 
  // 管理服务器
  // 服务器运行中,接收socket特定信号,执行操作命令
  server.on("secureConnection", socket => {
    socket.on("data", buffer => {
      try {
        // 过滤数据帧
        if (buffer.readUInt8(0) !== 0b11111111) return; // 根据第一个字节判断

        const data = buffer.slice(1); 
        const message = JSON.parse(data.toString());

        if (message.token !== configs.passphrase) return; // 过滤socket

        debug(`received command: ${message.command}`);

        switch(message.command) {
          case "STOP": 
            debug("Received STOP command, service is closing...");
            server.close();
            break;


          case "RESTART": 
            debug("Received RESTART command, service is restarting...");
            //debug(server);

            server.close(() => {
              // 
            });
            break;
          default:
            debug("Unknown Server Action.");
        }
      } catch (e) {
        debug("frame filter", e); //不做处理
      }
    });
  });

  // 启用监听
  server.listen({ 
    ipv6Only: false, 
    exclusive: true,
    host: system.isSupportIPv6 ? "::" : "0.0.0.0",
    port: "8443",
  }, function () {

    if (process.channel && process.send) {
      process.send({ 
        message: "服务器已启动",
        pid: process.pid,
        address: this.address(),
      });
    } else {

      // if (app.env === "development") console.clear();
      // 打印服务器启动后信息
      // print backend server running message
      debug("%s is running on: %o", process.title, this.address());

      const port = this.address().port;

      // open service url
      // @TODO: 采用服务端推送更新，给在线客户端推送更新
      if (isMac()) {
        //cp.exec(`open -u "https://localhost:${port}"`);
      }
    }
  });

  // workder process settings
  //

  process.on("message", (msg) => {
    if (msg === "shutdown") {
      // Initiate graceful close of any connections to server
    }
  });

  // event to request it to stop.
  process.on("SIGTSTP", () => {
    debug("Receive SIGTSTP signal.");
    server.close(() => { 
      // 
    });
  });

  // event to request termination.
  process.on("SIGTERM", () => {
    debug("Receive SIGTERM signal.");
    process.exit();
  });

}