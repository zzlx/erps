/**
 * *****************************************************************************
 * 
 * Store creater
 *
 * *****************************************************************************
 */

import { Store } from "./Store.mjs";
import { combineReducers } from "./combineReducers.mjs";
import * as M from "./middlewares/index.mjs";
import * as reducers from "../reducers/index.mjs";
import { isDevel } from "../utils/is/isDevel.mjs";

export function createStore (state) {

  const store = new Store(state);
  store.currentReducer = combineReducers(reducers);

  store.middlewares = [
    M.crashReporter,
    M.thunk,
    M.promise,
    M.timeoutScheduler,
    M.normalization,
    isDevel() && M.logger,
  ].filter(Boolean).map(fn => fn(store));


  return store.init();
}
