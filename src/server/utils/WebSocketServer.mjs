/**
 * *****************************************************************************
 *
 * WebSocket Server
 *
 * 客户端和服务器之间的低延迟\实时连接
 *
 * ## 数据帧格式
 *
 * 0                   1                   2                   3
 * 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-------+-+-------------+-------------------------------+
 * |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 * |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 * |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 * | |1|2|3|       |K|             |                               |
 * +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 * |     Extended payload length continued, if payload len == 127  |
 * + - - - - - - - - - - - - - - - +-------------------------------+
 * |                               |Masking-key, if MASK set to 1  |
 * +-------------------------------+-------------------------------+
 * | Masking-key (continued)       |          Payload Data         |
 * +-------------------------------- - - - - - - - - - - - - - - - +
 * :                     Payload Data continued ...                :
 * + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 * |                     Payload Data continued ...                |
 * +---------------------------------------------------------------+
 *
 * 详细定义请参考:[WebSocket Protocol](https://tools.ietf.org/html/rfc6455#page-27)
 *
 * *****************************************************************************
 */

import assert from 'assert';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import http from 'http';
import http2 from 'http2';
import { uuid } from '../../utils.lib.mjs';
import { HTTP_STATUS_CODES, } from '../../koa/constants.mjs';

const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const hashKey = key => 
  crypto.createHash('sha1').update(key + GUID, 'ascii').digest('base64');
const OPCODES = {
  CONTINUE: 0,
  TEXT: 1,
  BINARY: 2,
  CLOSE: 8,
  PING: 9,
  PONG: 10,
};

export default class WebSocket extends EventEmitter {
  constructor (options) {
    super();
    assert(options.server, 'Server is not provided.');
    this.server = options.server;

    server.on('upgrade', this.upgrade);
  }

  /**
   *
   */

  close (cb) {
    if (cb) this.once('close', cb);

    if (this.clients) {
      for (const client of this.clients) client.terminate();
    }

    const server = this._server;
    process.nextTick(emitClose, this);
  }

  /**
   *
   *
   */

  onData (data) {
    this.buffer = data;
    //this.processBuffer(); // 处理buffer

  }

  /**
   *
   *
   */

  upgrade (req, socket, head) {
    socket.on('error', socketOnError);

    const version = req.headers['sec-websocket-version'];
    const key = req.headers['sec-websocket-key'] 
      ? req.headers['sec-websocket-key'].trim()
      : null;
    const extensions = {};

    if (
      'GET' !== req['method'] || 
      'websocket' !== req.headers.upgrade.toLowerCase() ||
      !key ||
      (version !== 8 && version !== 13)
    ) {
      return abortHandshake(socket, 400);
    }

    if (!socket.readable || !socket.writable) return socket.destroy();

    // 对浏览器生产的key进行加密
    const hashKey = hashKey(key);

    // 构造相应头
    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${hashKey}`
    ];

    let protocol = req.headers['sec-websocket-protocol'];

    if (protocol) { 
      protocol = protocol.trim().split(/ *, */);
      protocol = prococol[0];

      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
      }
    }

    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
    }

    socket.write(headers.concat('\r\n').join('\r\n'));
    socket.removeListener('error', socketOnError);

  }

}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {net.Socket} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @param {Object} [headers] Additional HTTP response headers
 * @private
 */

function abortHandshake(socket, code, message, headers) {
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
 *
 */

function socketOnError () {
  this.destroy();
}

function upgradeHandler (req, socket, head) {

  socket.on('data', data => {
    data = decodeWsFrame(data); // 数据帧解码
    console.log(data);  // 打印帧
    console.log(String(data.payloadData)) // 打印帧负载字符串格式结果
  });
}

function decodeWsFrame(data) {
  // 游标
  let start = 0;
  // 定义帧字段格式
  let frame = {
    isFinal: (data[start] & 0x80) === 0x80,
    opcode: data[start++] & 0xF,
    masked: (data[start] & 0x80) === 0x80,
    payloadLen: data[start++] & 0x7F,
    maskingKey: '',
    payloadData: null
  };
  // 接下来的两字节对应的无符号整数作为负载长度
  if (frame.payloadLen === 126) {
    frame.payloadLen = (data[start++] << 8) + data[start++];
  } else if (frame.payloadLen === 127) { // 扩展的 8 字节对应的无符号整数作为负载长度
    frame.payloadLen = 0;
    for (let i = 7; i >= 0; --i) {
      frame.payloadLen += (data[start++] << (i * 8));
    }
  }

  if (frame.payloadLen) {
    // 如果使用了掩码
    if (frame.masked) {
      // 掩码键
      const maskingKey = [
        data[start++],
        data[start++],
        data[start++],
        data[start++]
      ];

      frame.maskingKey = maskingKey;
      // 负载数据与四字节的掩码键的每一个字节轮流进行按位抑或运算
      frame.payloadData = data
        .slice(start, start + frame.payloadLen)
        .map((byte, idx) => byte ^ maskingKey[idx % 4]);
    } else {
      frame.payloadData = data.slice(start, start + frame.payloadLen);
    }
  }

  return frame;
}

// 编码ws帧
function encodeWsFrame(data) {
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

/**
 *
 */

function unmask (maskBytes, data) {
  const payload = Buffer.alloc(data.length);
  // 
  for (let i = 0; i < data.length; i++) payload[i] = maskBytes[i % 4] ^ data[i];
  return payload;
}

/**
 *
 *
 * Referense: https://segmentfault.com/a/1190000022075295
 */

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

  if (FIN) {
  }

}

WebSocket.prototype.handleData = function (opcode, readData) {
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


WebSocket.prototype.send = function (data) {
  let opcode, buffer;
  if (Buffer.isBuffer(data)) { 
    opcode == OPCODES.BINARY; 
    buffer = data; 
  } else if (typeof data === 'string') { 
    opcode == OPCODES.TEXT; 
    buffer = Buffer.from(data, 'utf8'); 
  }
  this.doSend(opcode, buffer);
}

WebSocket.prototype.send = function (data) {
}
