/**
 * *****************************************************************************
 *
 * WebSocket Client
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
 * * webSocket.close: 关闭连接
 *
 * *****************************************************************************
 */

export default class WebSocketClient {
  constructor (host) {
    this.ws = new WebSocket(`wss://${host}/GraphQL`);
    this.ws.addEventListener('open', this.onOpen);
    this.ws.addEventListener('message', this.onMessage);
    this.ws.addEventListener('close', this.onClose);
  }

  onClose (event) {
    console.warn("Connection is closed.");
  }

  onOpen (event) {
    console.log('webSocket is connected.');
    this.ws.send('Hello Server!');
  }

  onMessage (event) {
    console.log('Message from server ', event.data);
    if(typeof e.data === 'string') {
      console.log("from server: ", e.data);
    }

    if(e.data instanceof ArrayBuffer){
      const buffer = e.data;
      console.log("Received arraybuffer");
    }
  }
}
