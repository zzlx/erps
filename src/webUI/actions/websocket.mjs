/**
 * *****************************************************************************
 *
 * websocket client
 *
 * *****************************************************************************
 */

import types from './types.mjs';

let ws = null; //

export const connect = url => store => store.dispatch({
  type: types.WEBSOCKET_CONNECT,
  payload: {
    url: getURI()
  }
});

const getWS = () => store => {
  const ws = new WebSocket(getURI(url), ['graphql', 'authority']); 

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
});

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

function getWebSocket () {
  if ()
}
