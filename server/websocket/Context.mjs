/**
 * *****************************************************************************
 *
 * WebSocket Server
 *
 * Referense:
 *
 * * [The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
 *
 * *****************************************************************************
 */ 
 
import crypto from 'crypto';
import http2 from 'http2';
import debuglog from '../debuglog.mjs';
import { 
  HTTP_STATUS_CODES,
  WEBSOCKET_STATUS_CODES as STATUS_CODES,
  WEBSOCKET_OPCODES as OPCODES,
} from '../constants.mjs';

const debug = debuglog('debug:websocket');

/**
 * The WebSocket application
 */

export default class Context {
  constructor () {
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

} // end of WebSoceket class

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
    payload = unmask(maskingKey, buffer.slice(idx, idx + length));
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
 * unmask data
 *
 * @param {} maskBytes
 * @param {Uint8Array} 
 * @return {Uint8Array} 
 */

function unmask (maskingKey, data) {
  if (!(maskingKey instanceof Uint8Array)) {
  }
  if (!(data instanceof Uint8Array)) {
    throw new TypeError('');
  }

  const payload = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i++) payload[i] = maskingKey[i % 4] ^ data[i];
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

