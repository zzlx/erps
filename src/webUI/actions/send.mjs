/**
 * *****************************************************************************
 *
 * websocket client
 *
 * [Websocket Server](../../services/utils/WebSocketServer.mjs)
 *
 * *****************************************************************************
 */

import types from './types.mjs';

let ws = null; //

export default function (data) {
  return store => {
    if (ws == null) {
      return createWebSocket().then(websocket => {
        ws = websocket;
        ws.addEventListener('message', event => {
          store.dispatch({
            type: types.WEBSOCKET_MESSAGE,
            payload: event
          });
        });
      });
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      return ({
        type: types.WEBSOCKET_SEND,
        payload: data
      });
    } else {
    }

    function createWebSocket (url, protocol = ['soap', 'wamp', 'graphql', 'authority']) {
      return new Promise((resolve, reject) => {
        try {
          const websocket = new WebSocket(getURI(url), protocol); 
          websocket.addEventListener('error', error => { 
            console.error(error); 
          });
          websocket.addEventListener('close', event => { 
            console.info(event); 
          });
          websocket.addEventListener('open', event => { 
            resolve(websocket); 
          });
        } catch (e) { reject(e); }
      });
    } // end of createWebSocket
  } // end of store
}

/**
 * *****************************************************************************
 *
 * Utilites
 *
 * *****************************************************************************
 */

function getURI (url = import.meta.url) {
  const urlObj = new URL(url);

  const protocol = urlObj.protocol === 'http' ? 'ws' : 'wss';
  const hostname = urlObj.hostname;
  const port = urlObj.port === "" ? "" : ":" + urlObj.port;
  const pathname = urlObj.pathname;

  return `${protocol}://${hostname}${port}`; 
}
