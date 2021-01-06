/**
 * *****************************************************************************
 *
 * wsc(WebSocket Client)
 *
 * WebSocket(url[, protocols])
 *
 * [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
 *
 * constants:
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
 * # Reference
 *
 * [WebSocketServer](../../server/utils/WebSocketServer.mjs)
 *
 * *****************************************************************************
 */

export default function getWS () {
  const ws = new WebSocket(getURL(), ['GraphQL', 'Authority']); 

  ws.addEventListener('error', (error) => {
    console.log('WebSocket Error ' + error);
  });

  ws.onclose = function (event) {
    console.warn("websocket connection is closed. %o", {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
    });
  };

  ws.addEventListener('open', (event) => {
    console.log('websocket connection is opening.');
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

  return ws;
}


/**
 *
 *
 */

function getURL (pathname = '') {
  const url = new URL(import.meta.url);
  const protocol = url.protocol === 'http' ? 'ws' : 'wss';
  const hostname = url.hostname;
  const port = url.port === ""
    ? url.protocol === 'http' ? '80' : '443'
    : url.port 

  return `${protocol}://${hostname}:${port}${pathname}`; 
}
