/**
 * WebSocket client application
 *
 * 一种在客户端与服务器端之间保持TCP长连接的网络协议,可以随时进行信息交换.
 * 通过websocket,服务器可以直接向客户端发送数据,而无需客户端周期性的请求服务器资
 * 源，用于动态更新数据内容。
 *
 * @file: web-socket-client.mjs
 */

export default function () {

  const url = 'wss://localhost:8080';
  const protocols = ['protocolOne', protocolTwo];
  const socket = new WebSocket(url, protocols);

  const selectedProtocol = null;


  // Send message to server
  socket.addEventListener('open', (event) => {
    selectedProtocol = socket.protocol;

    socket.send('Hello socket server.');
  });

  // Receiving messages from server
  socket.addEventListener('message', (event) => {
    console.log('receive message from server.', event.data);
  });

}

function eventHandler (event) {

}
