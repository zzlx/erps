/**
 * *****************************************************************************
 *
 * WebSocket Server
 *
 * Referense:
 *
 * * [The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
 * * [Websocket protocol PDF format](https://tools.ietf.org/pdf/rfc6455.pdf)
 *
 * *****************************************************************************
 */ 
 
import crypto from 'crypto';
import EventEmitter from 'events'; 
import http2 from 'http2';
import { 
  HTTP_STATUS_CODES,
  WEBSOCKET_STATUS_CODES as STATUS_CODES,
  WEBSOCKET_OPCODES as OPCODES,
} from './constants.mjs';
import debuglog from './debuglog.mjs';

const debug = debuglog('debug:websocket');

/**
 * The WebSocket application
 */

export default class Server extends EventEmitter {
  constructor (options = {}) {
    super();
    this.connections = new Map(); // 客户端链接存储器
  }

  /**
   * send ping message
   */

  ping () {

  }

  /**
   * send pong message
   */

  pong () {

  }

  /**
   *
   */

  upgradeHandler (req, socket, head) {
    socket.on('error', () => {
    });

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

    // 添加到服务端存储
    const address = socket.remoteAddress + ':' + socket.remotePort;
    const socketID = crypto.createHash('sha1').update(address + '_' + Date.now()).digest('hex');
    this.connections.set(socketID, socket); 

    socket.on('close', () => { 
      debug(`connection from ${address} (id:${socketID}) is closed.`);
      // 关闭时删除链接
      this.connections.delete(socketID);
    });

    let buffer = null;

    // 接收到data frame
    socket.on('data', dataFrame => {
      const res = decodeFrame(dataFrame);

      if (res.FIN === 0) {
        buffer = buffer ? buffer + res.payload : res.payload;
        return;
      }

      buffer = buffer ? buffer + res.payload : res.payload;

      switch (res.opcode) {
        case OPCODES.CONTINUE:
          break;
        case OPCODES.TEXT:
          this.emit('message', buffer.toString('utf8'));
          break;
        case OPCODES.BINARY:
          this.emit('message', buffer);
          break;
        case OPCODES.CLOSE:
          socket.end();
          break;
        case OPCODES.PING:
        case OPCODES.PONG:
        default:
          debug(`opcode: ${opcode}`);
          //this.close(1002, 'unhandled opcode: ' + opcode);
          //socket.end();
      }

      buffer = null;
    });

  }

  /**
   * 广播消息
   */

  broadcastMessage(data) {
    for (let client of this.connections) {
      client.write(data, 'utf8', () => { 
        debug('broadcast message: ', data);
      });
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

    socket.removeListener('error', () => {});
    socket.destroy();
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

  /**
   *
   *
   */

  send (socket, data) {
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

    socket.write(encodeMessage(opcode, buffer));
  }
} // end of WebSoceket class

export class Client extends EventEmitter {
  constructor (options = {}) {
    super();
    this.connections = new Map(); // 客户端链接存储器
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
 * unmask data
 *
 * @param {} maskBytes
 * @param {buffer} data
 */

function unmask (maskBytes, data) {
  const payload = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) payload[i] = maskBytes[i % 4] ^ data[i];
  return payload;
}

/**
 * calculate hash key
 */

function hashKey (key) {
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  return crypto.createHash('sha1').update(key + GUID).digest('base64');
}

/**
 * 构造wss地址
 *
 * Reference: [WebSocket URIs](https://tools.ietf.org/html/rfc6455#page-14)
 */

function getURI (url) {
  const urlObj = new URL(url);

  const protocol = urlObj.protocol === 'http' ? 'ws' : 'wss';

  const host = urlObj.hostname;
  const port = urlObj.port === "" ? "" : ":" + urlObj.port;
  const path = '/websocket';

  return `${protocol}://${hostname}${port}${path}`; 
}

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
  const byte1  = buffer.readUInt8(0);
  const FIN    = (byte1 & 0b10000000) >>> 7;
  const RSV1   = (byte1 & 0b01000000) >>> 6;
  const RSV2   = (byte1 & 0b00100000) >>> 5;
  const RSV3   = (byte1 & 0b00010000) >>> 4;
  const opcode = (byte1 & 0b00001111); 

  const byte2  = buffer.readUInt8(1);
  const MASK   = (byte2 & 0b10000000) >>> 7;
  let length   = (byte2 & 0b01111111);

  let idx = 2;

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
    payload = unmask(buffer.slice(idx, idx+=4), buffer.slice(idx, idx + length));
  }

  return { FIN, RSV1, RSV2, RSV3, opcode, payload } 
}

/**
 * Encode payload
 *
 * @param {}
 *
 */

function encodePayload (opcode, payload) {
  const FIN  = 0b10000000;
  const RSV1 = 0b01000000; 
  const RSV2 = 0b00100000; 
  const RSV3 = 0b00010000; 
  const byte1 = FIN & RSV1 & RSV2 & RSV3 & opcode; 

  const length = Buffer.byteLength(payload);

  if ()


}
