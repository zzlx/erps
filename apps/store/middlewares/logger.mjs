/**
 * *****************************************************************************
 *
 * logger middleware
 *
 * *****************************************************************************
 */

import { debuglog } from "../../utils/debuglog.mjs";
const debug = debuglog("debug:log");

export const logger = store => next => action => {
  if (!globalThis.window) return next(action); // 仅在客户端渲染时打印调试日志

  const prevState = store.getState();
  const result = next(action);
  const newState = store.getState();

  debug("Action: %s \n new state: %o", action.type, newState);

  return result;
};
