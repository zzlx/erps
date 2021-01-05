/**
 * *****************************************************************************
 *
 * wsc(WebSocket Client)
 *
 * WebSocket(url[, protocols])
 *
 * [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
 *
 * API Reference:
 *
 * Properties:
 *
 * * WebSocket.binaryType The binary data type used by the connection.
 * * WebSocket.bufferedAmount The number of bytes of queued data.
 * * WebSocket.extensions The extensions selected by the server.
 * * WebSocket.onclose An event listener to be called when the connection is closed.
 * * WebSocket.onmessage An event listener to be called when a message is received from the server. 
 * * WebSocket.onopen An event listener to be called when the connection is opened.
 * * WebSocket.protocol The sub-protocol selected by the server. 
 * * WebSocket.readyState The current state of the connection.['CONNECTING', 'OPEN','CLOSING','CLOSED']
 * * WebSocket.url The absolute URL of the WebSocket. 
 *
 * Methods:
 *
 * * WebSocket.close([code[, reason]]);
 * * WebSocket.send(data)
 *
 * Events:
 *
 * * close
 * * error
 * * message
 * * open
 *
 *
 * [WebSocketServer](../../server/utils/WebSocketServer.mjs)
 *
 * *****************************************************************************
 */

const wsc = Symbol('web-socket-client');

export default class WebSocketClient {
  constructor (url) {
    this.url = url;
  }

  send (data) {
    if (this.ws.readyState != 1) {
      console.info("Cannot send data to server, WebSocket.readyState: ", this.ws.readyState);
    } else {
      console.info('Send data to server success.');
      this.ws.send(data);
    }
  }

  get ws () {
    if (this[wsc] == null) {
      const ws = new WebSocket(getURL(this.url)); 

      ws.addEventListener('error', (error) => {
        console.log('WebSocket Error ' + error);
      });

      ws.addEventListener('close', (event) => {
        console.warn("websocket connection is closed.");
      });

      ws.addEventListener('open', (event) => {
        ws.send('{hello}');
      });

      ws.addEventListener('message', (event) => {
        if(typeof event.data === 'string') {
          console.log("from server: ", event.data);
        }

        if(event.data instanceof ArrayBuffer){
          const buffer = event.data;
          console.log("Received arraybuffer");
        }
      });

      this[wsc] = ws;
    }

    return this[wsc]
  }
}


/**
 *
 *
 */

function getURL (pathname = '/socket') {
  const url = new URL(import.meta.url);
  const protocol = url.protocol === 'http' ? 'ws' : 'wss';
  const hostname = url.hostname;
  const port = url.port === ""
    ? url.protocol === 'http' ? '80' : '443'
    : url.port 

  return `${protocol}://${hostname}:${port}${pathname}`; 
}
