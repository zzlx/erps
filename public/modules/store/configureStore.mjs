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

/**
 * Store configuration
 */ 

export default function configureStore (opts) {
  opts = opts || {};

  // @todo: 按用户存储才是合理的
  //
  opts.storeKey = opts.storeKey || 'app_user_id';

  // 首先从配置读取initialState
  // 然后尝试从本地读取State
  // 如果都未获取到state,则使用空对象
  const preloadedState = opts.initialState 
    ? opts.initialState
    : window.localStorage
      ? window.localStorage.getItem(opts.storeKey) 
        ? JSON.parse(window.localStorage.getItem(opts.storeKey)) 
        : Object.create(null)
      : Object.create(null);

  const reducers = opts.reducers;

  // middleware enhancer
  const middlewareArray = [
    crashReporter, 
    thunk,
    promise,
    timestamp,
    timeoutScheduler,
  ];

  if (env && env === 'development') middlewareArray.push(logger);

  const middlewareEnhancer = applyMiddleware(middlewareArray); 

  const enhancer = opts.monitorReducers
    ? compose(middlewareEnhancer, monitorReducers) 
    : middlewareEnhancer;

  const reducerObj = combineReducers(reducers);

  const store = createStore(reducerObj, preloadedState, enhancer);

  // 客户端存储数据
  store.subscribe(() => {
    window.localStorage.setItem(opts.storeKey, JSON.stringify(store.getState()));
  });

  return store;
}
