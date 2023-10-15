/**
 * *****************************************************************************
 *
 * WebSocket Protocol implementation
 *
 * Referense:
 *
 * * [The WebSocket Protocol](https://www.rfc-editor.org/info/rfc6455)
 *
 * *****************************************************************************
 */ 
 
import crypto from 'crypto';
import EventEmitter from 'events'; 
import http2 from 'http2';
import util from 'util';
import { byteMask as bitMask } from './index.mjs';

const debug = util.debuglog('debug:websocket');

/**
 * The WebSocket application
 */

export class Websocket extends EventEmitter {
  constructor (options = {}) {
    super();
    this.connections = new Map(); // 客户端链接存储器
    this.server = options.server;

    // Register upgrade event
    this.server.on('upgrade', (req, socket, head) => {
      this.upgradeHandler(req, socket, head);
    });

    this.on('message', (msg, socket) => {
      debug(`Recive: ${msg} from ${socket.remoteAddress}:${socket.remotePort}`);
    });

  }

  /**
   * upgrade handshake
   */

  upgradeHandler (req, socket, head) {
    socket.on('error', (error) => { debug(error); });

    const version = req.headers['sec-websocket-version'] || '';
    const key = req.headers['sec-websocket-key'] || '';
    const extensions = {};

    if (
      'GET' !== req['method'] || 
      'websocket' !== req.headers.upgrade.toLowerCase() ||
      !key ||
      (version !== '8' && version !== '13')
    ) {
      return abortHandshake(socket, 400);
    }

    if (!socket.readable || !socket.writable) {
      return socket.destroy();
    }

    // 构造相应头
    const resHeaders = [
      'HTTP/1.1 101 Switching Protocols', // status line
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${hashKey(key)}`
    ];

    let protocol = req.headers['sec-websocket-protocol'];

    if (protocol) { 
      protocol = protocol.trim().split(/ *, */);
      protocol = protocol[0];

      if (protocol) {
        resHeaders.push(`Sec-WebSocket-Protocol: ${protocol}`);
      }
    }

    // 服务器响应请求
    // 服务返回正确的信息后后才能正式建立websocket连接
    socket.write(resHeaders.concat('\r\n').join('\r\n'));

    // 链接存储逻辑
    const address = socket.remoteAddress + ':' + socket.remotePort;

    const socketID = crypto.createHash('sha1').update(address + '_' + Date.now()).digest('hex');
    this.connections.set(socketID, socket); // 添加到服务端存储

    debug(`websocket connection from ${address} (id:${socketID}) is established.`);

    socket.on('close', () => { 
      debug(`websocket connection from ${address} (id:${socketID}) is closed.`);
      this.connections.delete(socketID); // 关闭时删除链接
    });

    let buffer = null;

    const ua = req.headers['user-agent']; // 记录客户端类型

    // 接收到data frame
    socket.on('data', dataFrame => {
      const res = decodeFrame(dataFrame);

      if (res.FIN === 0) {
        buffer = buffer ? buffer + res.payload : res.payload;
        return;
      }

      buffer = buffer ? buffer + res.payload : res.payload;

      const context = new Context({
        socket: socket,
        app: this,
      });

      switch (res.opcode) {
        case OPCODES.CONTINUE:
          break;
        case OPCODES.TEXT:
          this.emit('message', buffer.toString('utf8'), socket);
          socket.write(encode(buffer, 0x1));
          break;
        case OPCODES.BINARY:
          this.emit('message', buffer, socket);
          break;
        case OPCODES.CLOSE:
          socket.end();
          break;
        case OPCODES.PING:
          // send a pong frame
          socket.write(encode(buffer, 0xA));
          break;
        case OPCODES.PONG:
          // receive a pong frame
          //socket.write(encode('receive pong', 0x1));
          break;
        default:
          debug(`opcode: ${res.opcode} desc: none control frame`);
          //this.close(1002, 'unhandled opcode: ' + opcode);
          //socket.end();
      }

      buffer = null;
    });

  }

  /**
   * 广播消息
   */

  broadcast(data) {
    for (const conn of this.connections) {
      conn.write(data, 'utf8', () => { 
        debug('broadcast message: ', data);
      });
    }
  }

  /**
   *
   */

  close (cb) {
    if (this.connections) {
      for (const client of this.connections.values()) {
        client.end();
      }
    }
  }
} // end of WebSoceket class

/**
 * 
 *
 */

class Context {
  constructor (options = {}) {
    this.socket = options.socket;
    this.app = options.app;

  }

  /**
   * 发出消息
   */

  send () {
    //this.socket.send(...arguments);
  }

  /**
   * 广播消息
   */

  broadcast () {
    this.app.broadcast(...arguments);
  }

}

/**
 * *****************************************************************************
 *
 * Utilities
 *
 * *****************************************************************************
 */

/**
 * Parse Data Frame 
 *
 * Reference: 
 * [Base Framing Protocol](https://tools.ietf.org/html/rfc6455#section-5.2)
 *
 * @param {object} buffer
 * @return {object}
 */

function decodeFrame (buffer) {
  let idx = 0;

  const byte1  = Uint8Array.from(buffer.slice(idx, ++idx));
  const FIN    = (byte1 & 0b10000000) >>> 7;
  const RSV1   = (byte1 & 0b01000000) >>> 6;
  const RSV2   = (byte1 & 0b00100000) >>> 5;
  const RSV3   = (byte1 & 0b00010000) >>> 4;
  const opcode = (byte1 & 0b00001111); 

  const byte2  = Uint8Array.from(buffer.slice(idx, ++idx));
  const MASK   = (byte2 & 0b10000000) >>> 7;
  let length   = (byte2 & 0b01111111);

  if (length === 0b01111110) {
    length = buffer.readUInt16BE(idx);
    idx+=2;
  } else if (length === 0b01111111) {
    const heightBits = buffer.readUint32BE(idx);
    if (heightBits != 0) {}
    idx+=4;
    length = buffer.readUInt32BE(idx);
    idx+=4;
  }

  let payload = buffer.slice(idx, idx + length);

  if (MASK) {
    const maskingKey = buffer.slice(idx, idx+=4);

    // unmask
    payload = bitMask(buffer.slice(idx, idx + length), maskingKey);
  }

  return { FIN, RSV1, RSV2, RSV3, opcode, payload } 
}

/**
 * Encode payload
 *
 * @param {}
 * @param {buffer} payload * @return {} buffer
 */

function encode (payload, opcode, mask = false) {
  // set opcode if not setting 
  if (opcode == null) {
    if (typeof payload === 'string') opcode = 0x1; 
    if (payload instanceof Uint8Array) opcode = 0x2;
  }

  const FIN  = 0b10000000;
  const RSV1 = 0b00000000; 
  const RSV2 = 0b00000000; 
  const RSV3 = 0b00000000; 
  const byte1 = Uint8Array.from([FIN | RSV1 | RSV2 | RSV3 | opcode]);

  let data = payload instanceof Uint8Array 
    ? payload
    : typeof payload === 'string'
      ? Buffer.from(payload)
      : new Uint8Array(1);
  const length = data.byteLength;

  let byte2 = null;
  let extendedLength = null;

  if (length < 126) { 
    byte2 = Uint8Array.from([length]);
  } else if (length <= 65535) {
    byte2 = Uint8Array.from([126]);
    extendedLength = Uint16Array.from([length]);
  } else {
    byte2 = Uint8Array.from(127);
    extendedLength = Uint64Array.from([length]);
  }

  if (mask) { }

  return Buffer.concat([byte1, byte2, data]); 
}

/**
 * Generate a 32bits masking key
 */

function generateMaskingKey () {
  const maskingKey = new ArrayBuffer(4);
  const view = new DataView(maskingKey);
  view.setUint32(0, Number('0b' + Math.random().toString(2).substr(2, 32)));
  return maskingKey;
}

/**
 * calculate hash key
 */

function hashKey (key) {
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  return crypto.createHash('sha1').update(key + GUID).digest('base64');
}

// opcode value:
// * 0b0000 denotes a continuation frame
// * 0b0001 denotes a text frame
// * 0b0010 denotes a binary frame
// * 3-7 are reserved for further non-control frames
// * 0b1000 denotes a connection close
// * 0b1001 denotes a ping
// * 0b1010 denotes a pong
// 11-15 are reserved for further control frames
//
export const STATUS_CODES = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',
  1004: 'Reserved',
  1007: 'Data Type Error',
  1008: 'Violates Policy',
  1009: 'Too Big to Process',
}

export const OPCODES = {
  CONTINUE: 0x0, 
  // non-control frame opcodes
  TEXT:     0x1,
  BINARY:   0x2,
  // 0x3-0x7 // for non-control frame
  // control frame opcodes
  CLOSE:    0x8,
  PING:     0x9,
  PONG:     0xA,
  // 0xB - oxF for control-frame
}
