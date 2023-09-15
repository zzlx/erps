/**
 * *****************************************************************************
 *
 * logger middleware
 *
 * *****************************************************************************
 */

import { debuglog } from "../../utils/debuglog.mjs";
const debug = debuglog("debug:logger");

export const logger = store => next => action => {
  if (!globalThis.window) return next(action); // 仅在客户端渲染时打印调试日志

  const prevState = store.getState();
  const result = next(action);
  const newState = store.getState();

  // print debug message
  debug(prevState, "Action: " + action.type + action.payload, newState); 

  return result;
};
