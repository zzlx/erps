/**
 * *****************************************************************************
 *
 * WebSocket
 *
 * 客户端和服务器之间的低延迟\实时的连接
 * [The WebSocket Protocol](https://tools.ietf.org/html/rfc6455#page-27)
 *
 *
 *
 * *****************************************************************************
 */

import crypto from 'crypto';
import EventEmitter from 'events'; 
import { uuid } from '../utils.lib.mjs';

export default class WebSocket extends EventEmitter {
  constructor (server) {
    super();

    server.on('upgrade', (req, socket, head) => {
      if ('GET' !== req['method']) return;

      // 获取客户端返回的 key 与 GUID 进行 sha1 编码后获取 base64 格式摘要
      let key = req.headers['sec-websocket-key'];
      const GUID = uuid(Buffer.from(key)); 
      key = crypto.createHash('sha1').update(key + GUID).digest('base64');
      console.log(key);

      // 返回 101 协议切换响应
      const resMsg = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Accept: ' + key,
      ].join('\r\n');

      socket.write(resMsg);
    });
  }
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
