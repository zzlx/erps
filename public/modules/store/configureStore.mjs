// private modules
import applyMiddleware from './applyMiddleware.mjs';
import combineReducers from './combineReducers.mjs';

import crashReporter from './middlewares/crashReporter.mjs';
import thunk from './middlewares/thunk.mjs';
import promise from './middlewares/promise.mjs';
import timestamp from './middlewares/timestamp.mjs';
import timeoutScheduler from './middlewares/timeoutScheduler.mjs';
import logger from './middlewares/logger.mjs';

import monitorReducers from './enhancers/monitorReducers.mjs';
import createStore from './createStore.mjs';
import compose from './compose.mjs';

import * as reducers from './reducers/index.mjs';

/**
 * Store configuration
 */ 

export default function configureStore (preloadedState = Object.create(null)) {
  // middleware enhancer
  const middlewares = [
    crashReporter, 
    thunk,
    promise,
    timestamp,
    timeoutScheduler,
    (env && env === 'development') ? logger : false
  ].filter(Boolean);

  const middlewareEnhancer = applyMiddleware(middlewares); 

  const enhancer = monitorReducers
    ? compose(middlewareEnhancer, monitorReducers) 
    : middlewareEnhancer;

  const reducerObj = combineReducers(reducers);

  const store = createStore(reducerObj, preloadedState, enhancer);

  return store;
}
