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

export default data => ({
  type: types.WEBSOCKET_SEND,
  payload: data
});
