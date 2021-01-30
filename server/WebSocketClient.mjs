/**
 * *****************************************************************************
 *
 * WebSocket Client
 *
 *
 *
 * *****************************************************************************
 */ 

export default class Client {

}

/**
 * 构造wss地址
 *
 * Reference: [WebSocket URIs](https://tools.ietf.org/html/rfc6455#page-14)
 */

function getURI (url) {
  const urlObj = new URL(url);

  const protocol = urlObj.protocol === 'http' ? 'ws' : 'wss';

  const host = urlObj.hostname;
  const port = urlObj.port === "" ? "" : ":" + urlObj.port;
  const path = '/websocket';

  return `${protocol}://${hostname}${port}${path}`; 
}
