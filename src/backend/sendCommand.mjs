/**
 * *****************************************************************************
 *
 * 发送命令给服务进程
 *
 * *****************************************************************************
 */

import tls from 'node:tls';
import util from 'node:util';
import { configs, paths } from "./settings/index.mjs";

const debug = util.debuglog('debug:sendCommand');

export function sendCommand (command) {
  const options = {
    host: "localhost",
    port: "8443", // the port should connect to
    ca: configs.cert,
    rejectUnauthorized: false,
    checkServerIdentity: (hostname, cert) => {
      return null;
    },
  };

  return new Promise((resolve, reject) => {
    const socket = tls.connect(options, () => {
      process.stdin.pipe(socket);
      process.stdin.resume();
    });

    socket.on('end', () => {
      debug('server ends connection');
    });

    socket.on('secureConnect', () => {
      // byte1: token
      const byte1 = new Uint8Array(1);
      byte1.set([0b11111111], 0);

      const data = Buffer.from(JSON.stringify({
        token: configs.passphrase,
        authorized: socket.authorized,
        command: command
      }));

      debug('send command: %s', command);
      socket.end(Buffer.concat([byte1, data]));

      resolve();
    });

    socket.on("error", e => { 
      if (e.code === "ECONNREFUSED") {
        debug('主控程序发送控制信号被拒绝:', e.code);
      } else if (e.code === "ECONNRESET") {
        debug('服务器端主动断开连接:', e.code);
      } else {
        debug('主控程序客户端错误:', e.code) 
      }
    }); // error event
  //
  });
}
