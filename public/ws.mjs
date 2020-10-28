/**
 * *****************************************************************************
 *
 * Web Socket Client
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
 * *****************************************************************************
 */

const url = new URL(import.meta.url);
const protocol = url.protocol === 'https:' ? 'wss' : 'ws';
const webSocket = new WebSocket(`${protocol}://${url.host}/api/socket`);

webSocket.onopen = function (e) {
  console.log("Connection open ...");
  this.send("Hello WebSockets!");
};

webSocket.onerror = function (error) {
  console.log(error);
}

webSocket.onmessage = function (e) {
  console.log('Receiving a message');

  if(typeof e.data === 'string') {
    console.log("Received data string");
  }

  if(e.data instanceof ArrayBuffer){
    const buffer = e.data;
    console.log("Received arraybuffer");
  }
  webSocket.close();
};

webSocket.onclose = function (e) {
  console.log("Connection closed.");
};
