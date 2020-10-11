/**
 *
 * Store configuration
 *
 *
 *
 *
 *
 *
 */ 

import applyMiddleware from './applyMiddleware.mjs';
import monitorReducers from './enhancers/monitorReducers.mjs';
import createStore from './createStore.mjs';
import compose from './compose.mjs';
import * as M from './middlewares/index.mjs';
import reducer from '../reducers/index.mjs';
import global from '../utils/global.mjs';
import settings from '../settings.mjs';

export default function configureStore (preloadedState = Object.create(null)) {
  // middleware enhancer
  const middlewares = [
    M.crashReporter, 
    M.thunk,
    M.promise,
    M.timeoutScheduler,
    settings.development ? M.logger : false,
  ].filter(Boolean);

  const middlewareEnhancer = applyMiddleware(middlewares); 

  const enhancer = monitorReducers
    ? compose(middlewareEnhancer, monitorReducers) 
    : middlewareEnhancer;

  const store = createStore(reducer, preloadedState, enhancer);

  return store;
}
