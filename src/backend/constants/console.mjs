/**
 * *****************************************************************************
 *
 * Constants
 *
 *
 *
 * *****************************************************************************
 */

export const CLEAR_PAGE = process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';
export const CLEAR_LINE = '\x1B[0K';
export const MOVE_LEFT = '\x1B[1000D';
export const MOVE_UP = '\x1B[1A';
