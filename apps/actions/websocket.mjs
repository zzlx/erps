/**
 * *****************************************************************************
 * 
 * Redux websocket middleware
 *
 * WebSocket Client
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

let ws = null;

export function websocket (store) {
  const getWS = url => new Promise((resolve, reject) => {
    if (ws && ws.readyState === 1) { 
      return resolve(ws); 
    }

    try {
      const startTime = Date.now();

      ws = new WebSocket(uri(), 'graphql'); // 建立websocket链接,使用graphql协议

      ws.onerror = function (error) {
        store.dispatch({ type: 'WEBSOCKET_ERROR', payload: event });
      }

      ws.onclose = function (event) {
        store.dispatch({ type: 'WEBSOCKET_CLOSED', payload: event });
      }

      ws.onopen = function (event) { 
        resolve(ws); 
      };

      ws.onmessage = function (event) {
        store.dispatch({ type: 'WEBSOCKET_MESSAGE', payload: event });
      };

    } catch (e) {
      store.dispatch({ type: 'WEBSOCKET_ERROR', payload: e });
    }
  });

  return next => action => { 
    if (action && action.type === 'WEBSOCKET_SEND') {
      const payload = action.payload;
      const data  = typeof payload === 'string' ? payload : JSON.stringify(payload);

      getWS().then(socket => { socket.send(data); });

    }

    return next(action);
  }
}

/**
 * websocket enter point uri
 */

export function uri (url = import.meta.url) {
  const urlObj = new URL(url);

  const protocol = urlObj.protocol === 'http' ? 'ws' : 'wss';
  const hostname = urlObj.hostname;
  const port = urlObj.port === "" ? "" : ":" + urlObj.port;
  const pathname = '/data';

  return `${protocol}://${hostname}${port}${pathname}`; 
}
