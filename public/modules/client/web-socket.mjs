/**
 * *****************************************************************************
 *
 * web socket
 *
 * API Reference:
 *
 * * webSocket.readyState 
 *   返回实例对象当前状态,共有4种['CONNECTING', 'OPEN','CLOSING','CLOSED']
 * * webSocket.onopen
 *   用于指定连接成功后的回调函数
 * * webSocket.onclose
 *   用于指定连接关闭后的回调函数
 * * webSocket.onmessage
 *   用于指定收到服务器数据后的回调函数
 * * webSocket.send()
 *   用于向服务器发送数据
 * *  webSocket.bufferedAmount
 *   表示还有多少字节的二进制数据没有发送出去
 * *  webSocket.onerror
 *   用于指定报错时的回调函数
 *
 *
 * *****************************************************************************
 */

const location = globalThis.location || {};
const hostname = location.hostname;
const port = location.port === "" ? "" : ":" + location.port;
const protocol = location.protocol === 'https:' ? 'wss': 'ws';
const url = `${protocol}://${hostname}${port}`;
const ws = new WebSocket(url);

ws.onopen = function(evt) {
  console.log("Connection open ...");
  ws.send("Hello WebSockets!");
};

ws.onmessage = function(evt) {
  if(typeof event.data === 'string') {
    console.log("Received data string");
  }

  if(event.data instanceof ArrayBuffer){
    var buffer = event.data;
    console.log("Received arraybuffer");
  }
  ws.close();
};

ws.onclose = function(evt) {
  console.log("Connection closed.");
};
