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
const ws = new WebSocket(`wss://${url.host}/api/socket`);

ws.onopen = (event) => {
  console.log('webSocket is connected.');
  this.send("from client: Hello!");
};

ws.onmessage = (e) => {
  if(typeof e.data === 'string') console.log("from server: ", e.data);

  if(e.data instanceof ArrayBuffer){
    const buffer = e.data;
    console.log("Received arraybuffer");
  }

  // 不主动关闭ws连接
  //wsc.close();
}

ws.onclose = () => console.warn("Connection is closed.");
ws.onerror = error => console.error(error);
