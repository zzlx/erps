/**
 * *****************************************************************************
 *
 * Constants
 *
 *
 *
 * *****************************************************************************
 */

export const WEBSOCKET_OPCODES = {
  CONTINUE: 0,
  TEXT: 1,
  BINARY: 2,
  CLOSE: 8,
  PING: 9,
  PONG: 10,
};

export const WEBSOCKET_STATUS_CODES = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',
}
