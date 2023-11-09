/**
 * *****************************************************************************
 * 
 * HTTP Daemon
 *
 * Server-side http2 application
 *
 * ## Features:
 * * http2
 * * 支持websocket socket
 *
 * *****************************************************************************
 */

import cp from "node:child_process";
import http2 from "node:http2";
import process from "node:process";
import util from "node:util";

// import { Websocket } from "./utils/Websocket.mjs";
import { capitalize, isMac } from "./utils/index.mjs";
import { configs } from "./settings/configs.mjs";
import { app } from "./app.mjs";

const debug = util.debuglog("debug:https");

const https = http2.createSecureServer({
  allowHTTP1: true,
  ca: configs.ca,
  key: configs.privateKey,
  cert: configs.cert, // use fullchain as cert
  passphrase: configs.passphrase,
  requestCert: false, // 客户端证书支持,特殊应用支持
  rejectUnauthorized: false,
  // sigalgs: 
  // ciphers: 
  // clientCertEngine: 
  // dhparam
  // ecdhCurve
  // origins: [],
  // privateKeyEngine
  // pfx: fs.readFileSync("etc/ssl/localhost_cert.pfx"),
  // ticketKeys: crypto.randomBytes(48), 
  handshakeTimeout: 120 * 1000, // milliseconds
  sessionTimeout: 300, // seconds
});

https.on("error", e => {
  if (e.code === "EADDRINUSE") { 

    if (process.send) {
      process.send(e);
    } else {
      // debug(`${process.title} is already runing on ${e.address}:${e.port}, try again later`);
      debug(
        "Process: %s is already running on port %s, try again later.",
        capitalize(process.title),
        e.port,
      );
    }

    if (isMac()) {
      // cp.exec(`lsof -i:${e.port} |xargs killall`);
    }

  } else {
    debug(e); // 打印错误信息
  }

});

// stream handler
// stream is a Duplex
https.on("stream", app.callback());

// Websocket support
// const ws = new Websocket({ server: server, });

// he "secureConnection" event is emitted after the handshaking process 
// for a new connection has successfully completed. 
// 管理服务器
// 服务器运行中,接收socket特定信号,执行操作命令
https.on("secureConnection", socket => {
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
          https.close();
          break;


        case "RESTART": 
          debug("Received RESTART command, service is restarting...");
          // debug(server);

          https.close(() => {
            // 
          });
          break;
        default:
          debug("Unknown Server Action.");
      }
    } catch (e) {
      debug("frame filter", e); // 不做处理
    }
  });
});

// 启用监听
https.listen({ 
  ipv6Only: false, 
  exclusive: true,
  host: configs.IPv6 ? "::" : "0.0.0.0",
  port: configs.port,
}, function () {

  if (process.channel && process.send) {
    process.send({ 
      message: "服务器端口已被占用,请确认服务是否已启动",
      pid: process.pid,
      // address: this.address(),
    });
  } else {

    // if (app.env === "development") console.clear();
    // 打印服务器启动后信息
    // print backend server running message
    debug("Https is running on address:%j", this.address());

    // open service url
    // @TODO: 采用服务端推送更新，给在线客户端推送更新
    if (isMac()) {
      // cp.exec(`open -u "https://localhost:${port}"`);
      cp.exec(`open -a Safari https://localhost:${configs.port}`, (err, stdout, stderr) => {
        if (err) debug(err);
        if (stdout) debug(stdout);
        if (stderr) debug(stderr);
      });
    }
  }
});

// Process settings
process.on("uncaughtException", (error, origin) => {
  debug("The uncaughted exception: ", error);
  debug("The origin uncaught exception: ", origin);
});

process.on("unhandledRejection", (reason, promise) => {
  debug(
    "Rejection is come from ", promise, " because of: ", reason,
  );
});

process.on("message", (msg) => {
  if (msg === "shutdown") {
    // Initiate graceful close of any connections to server
  }
});

// event to request it to stop.
process.on("SIGTSTP", () => {
  debug("Receive SIGTSTP signal.");

  // server在cluster中的状态
  https.close(() => { 
    // 
  });
});

// event to request termination.
process.on("SIGTERM", () => {
  debug("Receive SIGTERM signal.");
  process.exit();
});
