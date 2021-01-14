/**
 * *****************************************************************************
 *
 * WebSocket
 *
 * [Documentation](./WebSocket.md)
 *
 * *****************************************************************************
 */ 
 
import assert from 'assert';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import http from 'http';
import util from 'util';
import debuglog from './utils/debuglog.mjs';
import { HTTP_STATUS_CODES, } from './koa/constants.mjs';

const debug = debuglog('debug:websocket-server');

const OPCODES = {
  CONTINUE: 0,
  TEXT: 1,
  BINARY: 2,
  CLOSE: 8,
  PING: 9,
  PONG: 10,
};

const STATUS_CODES = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',
}

const clients = Symbol('websocketConnections');

export default class WebSocket extends EventEmitter {
  constructor (options = {}) {
    super();
    assert(typeof options === 'object', 'WebSocket options must be an Object.');
    this.opts = Object.assign({}, {
      env: process.env.NODE_ENV || 'production',
    }, options);

    this.server = this.opts.server || http.createServer(); 

    this.closed = false;
    this.buffer = Buffer.alloc(0);

    this[clients] = new Set();

    // register upgrade handler
    this.server.on('upgrade', (req, socket, head) => {
      this.upgradeHandler(req, socket, head);
    });
  }

  upgradeHandler (req, socket, head) {
    socket.on('error', socketOnError);

    const version = req.headers['sec-websocket-version'];
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

    socket.write(resHeaders.concat('\r\n').join('\r\n'));

    const address = socket.remoteAddress + ':' + socket.remotePort;

    socket.on('close', () => { 
      debug('connection from ', address, ' is closed.');
      this[clients].delete(socket);
    });

    socket.removeListener('error', socketOnError);

    socket.on('data', (data) => {
      this.buffer = data;
      this.processBuffer();
    });

    this[clients].add(socket); // 添加到服务端存储

    debug('websocket connection establised');
  }

  /**
   * 广播消息
   */

  broadcastMessage(data) {
    for (let client of this[clients]) {
      client.write(data, 'utf8', () => { 
        debug('broadcast message: ', data);
      });
    }
  }

  /**
   *
   */


  /**
   * Close the connection when preconditions are not fulfilled.
   *
   * @param {net.Socket} socket The socket of the upgrade request
   * @param {Number} code The HTTP response status code
   * @param {String} [message] The HTTP response body
   * @param {Object} [headers] Additional HTTP response headers
   * @private
   */

  abortHandshake(socket, code, message, headers) {
    if (socket.writable) {
      message = message || HTTP_STATUS_CODES[code];
      headers = {
        Connection: 'close',
        'Content-Type': 'text/html',
        'Content-Length': Buffer.byteLength(message),
        ...headers
      };

      socket.write(
        `HTTP/1.1 ${code} ${HTTP_STATUS_CODES[code]}\r\n` +
          Object.keys(headers)
            .map((h) => `${h}: ${headers[h]}`)
            .join('\r\n') +
          '\r\n\r\n' +
          message
      );
    }

    socket.removeListener('error', socketOnError);
    socket.destroy();
  }

  /**
   *
   */

  close (cb) {
    if (this.clients) {
      for (const client of this.clients) client.terminate();
    }

    //const server = this._server;
    //process.nextTick(emitClose, this);
  }

  handleData (opcode, readData) {
    debug('opcode: ', opcode);

    switch (opcode) {
      case OPCODES.TEXT: 
        this.emit('data', readData.toString('utf8'));
        break;
      case OPCODES.BINARY:
        this.emit('data', readData);
        break;
      default:
        this.close(1002, 'unhandle opcode: ' + opcode);
    }
  }

  send (data) {
    let opcode, buffer;

    if (Buffer.isBuffer(data)) { 
      opcode == OPCODES.BINARY; 
      buffer = data; 
    } else if (typeof data === 'string') { 
      opcode == OPCODES.TEXT; 
      buffer = Buffer.from(data, 'utf8'); 
    } else {
      throw new Error('cannot send object. must be send buffer or string.');
    }
    this.doSend(opcode, buffer);
  }

  doSend (opcode, buffer) {
    this.socket.write(encodeMessage(opcode, buffer));
  }

  processBuffer () {
    let buf = this.buffer;
    let idx = 2;
    const byte1 = buf.readUInt8(0);
    const str1 = byte1.toString(2);
    const FIN = str1[0];
    let opcode = byte1 & 0x0f;
    const byte2 = buf.readUInt8(1);
    const str2 = byte2.toString(2);
    const MASK = str2[0];
    let length = parseInt(str2.substring(1), 2);

    if (length === 126) {
      length = buf.readUInt16BE(2);
      idx += 2;
    } else if (length === 127) {
      const highBits = buf.readUInt32BE(2);
      if (highBits != 0) {
        this.close(1009, '');
      }

      length = buf.readUInt32BE(6);
      idx +=8;
    }

    let realData = null;

    if (MASK) {
      const maskDataBuffer = buf.slice(idx, idx + 4);
      idx+=4;
      const realDataBuffer = buf.slice(idx, idx + length);
      realData = unmask(maskDataBuffer, realDataBuffer);
    }

    let realDataBuffer = Buffer.from(realData);
    this.buffer = buf.slice(idx + length);

    if (FIN) {
      this.handleRealData(opcode, realDataBuffer); // 处理操作码
    }
  }

  handleRealData (opcode, realDataBuffer) {
    switch (opcode) {
      case OPCODES.TEXT:
        this.emit('data', realDataBuffer.toString('utf8'));
        this.broadcastMessage(realDataBuffer.toString());
        break;
      case OPCODES.BINARY:
        this.emit('data', realDataBuffer);
        break;
      default:
        this.close(1002, 'unhandled opcode: ' + opcode);
    }
  }

} // end of WebSoceket class

/**
 * Utilities
 *
 */

// 编码ws帧
function encodeWsFrame (data) {
  const isFinal = data.isFinal !== undefined ? data.isFinal : true, // 没有 isFinal 字段默认为终止帧
    opcode = data.opcode !== undefined ? data.opcode : 1, // 默认编码为文本帧
    payloadData = data.payloadData ? new Buffer(data.payloadData) : null,
    payloadLen = payloadData ? payloadData.length : 0;

  let frame = [];

  // 帧的第一个字节
  if (isFinal) frame.push((1 << 7) + opcode);
  else frame.push(opcode);

  // 帧的负载长度处理
  if (payloadLen < 126) {
    frame.push(payloadLen);
  } else if (payloadLen < 65536) {
    frame.push(126, payloadLen >> 8, payloadLen & 0xFF);
  } else {
    frame.push(127);
    for (let i = 7; i >= 0; --i) {
      frame.push((payloadLen & (0xFF << (i * 8))) >> (i * 8));
    }
  }

  // 合并头部和负载数据
  frame = payloadData ? Buffer.concat([new Buffer(frame), payloadData]) : new Buffer(frame);

  console.dir(decodeWsFrame(frame));
  return frame;
}

function rawFrameParseHandle(socket) {
  let frame,
    frameArr = [], // 用来保存分片帧的数组
    totalLen = 0;  // 记录所有分片帧负载叠加的总长度
  socket.on('data', rawFrame => {
    frame = decodeWsFrame(rawFrame);

    if (frame.isFinal) {
      // 分片的终止帧
      if (frame.opcode === 0) {
        frameArr.push(frame);
        totalLen += frame.payloadLen;

        let frame = frameArr[0],
          payloadDataArr = [];
        payloadDataArr = frameArr
          .filter(frame => frame.payloadData)
          .map(frame => frame.payloadData);
        // 将所有分片负载合并
        frame.payloadData = Buffer.concat(payloadDataArr);
        frame.payloadLen = totalLen;
        // 根据帧类型进行处理
        opHandle(socket, frame);
        frameArr = [];
        totalLen = 0;
      } else { // 普通帧
        opHandle(socket, frame);
      }
    } else { // 分片起始帧与附加帧
      frameArr.push(frame);
      totalLen += frame.payloadLen;
    }
  });
}

function readData (buffer) {
  let idx = 2;

  const byte_1 = buffer.readUInt8(0);
  const str_1 = byte_1.toString(2);
  const FIN = str_1[0];
  let opcode = byte_1 & 0x0f;

  const byte_2 = buffer.readUInt8(1)
  const str_2 = byte_2.toString(2);
  const MASK = str_2[0];
  let length = parseInt(str_2.substr(2), 2);

  if (length === 0x7e) {
    length = buffer.readUInt16BE(2);
    idx+=2;
  } else if (length === 0x7f) {
    const highBits = buffer.readUInt32BE(2);
    // 数据异常
    if (highBits != 0) {
    }
    length = buffer.readUInt32BE(6);
    idx+=8;
  }

  let data = null;

  if (MASK) {
    const maskDataBuffer = buffer.slice(idx, idx + 4);
    idx+=4;
    const dataBuffer = buffer.slice(idx, idx + length);
    data = unmask(maskDataBuffer, dataBuffer);

  }

  let dataBuffer = Buffer.from(data);

  // 
  if (FIN) {
    this.handleRealData(opcode, realDataBuffer);
  }
}

/**
 * 解析数据
 */

function unmask (maskBytes, data) {
  const payload = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) payload[i] = maskBytes[i % 4] ^ data[i];
  return payload;
}

/**
 * 信息编码
 */

function encodeMessage (opcode, payload) {
  let buf;

  let b1 = 0x80 | opcode;
  let b2;
  let length = payload.length;

  if (length < 126) {
    buf = Buffer.alloc(playload.length + 2 + 0);
    b2 = length;
    buf.writeUInt8(b1, 0);
    buf.writeUInt8(b2, 1);
  }

  return buf;
}

/**
 * 计算hash值
 */

function hashKey (key) {
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  return crypto.createHash('sha1').update(key + GUID).digest('base64');
}

/**
 * socket on error
 */

function socketOnError () {
  this.destroy();
}
