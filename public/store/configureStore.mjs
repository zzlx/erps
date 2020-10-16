/**
 * *****************************************************************************
 *
 * Store configuration
 *
 *
 *
 *
 * *****************************************************************************
 */ 

import applyMiddleware from './applyMiddleware.mjs';
import createStore from './createStore.mjs';
import compose from './compose.mjs';
import M from './middlewares.mjs';
import reducer from '../reducers/index.mjs';

export default function configureStore (preloadedState = Object.create(null)) {
  // middleware enhancer
  const middlewares = [
    M.crashReporter, 
    M.thunk,
    M.promise,
    M.timeoutScheduler,
    globalThis.env === 'development' ? M.logger : false,
  ].filter(Boolean);

  const middlewareEnhancer = applyMiddleware(middlewares); 

  /*
  const enhancer = monitorReducers
    ? compose(middlewareEnhancer, monitorReducers) 
    : middlewareEnhancer;
  */

  const store = createStore(reducer, preloadedState, middlewareEnhancer);

  return store;
}
