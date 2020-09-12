/**
 * *****************************************************************************
 *
 * Store 对象
 * ==========
 *
 * @TODO: 未完成
 *
 * *****************************************************************************
 */

import applyMiddleware from './applyMiddleware.mjs';
import combineReducers from './combineReducers.mjs';
import compose from './compose.mjs';
import * as reducers from './reducers/index.mjs';

import crashReporter from './middlewares/crashReporter.mjs';
import thunk from './middlewares/thunk.mjs';
import promise from './middlewares/promise.mjs';
import timestamp from './middlewares/timestamp.mjs';
import timeoutScheduler from './middlewares/timeoutScheduler.mjs';
import logger from './middlewares/logger.mjs';
import monitorReducers from './enhancers/monitorReducers.mjs';

import { types } from './actions/index.mjs';
import value from '../utils/value.mjs';
import getIn from '../utils/getIn.mjs';

const LISTENERS = Symbol('listeners');
const REDUCER = Symbol('reducer');

export default function store (preloadedState = Object.create(null)) {
  const State = preloadedState;
  const reducerObj = combineReducers(reducers);

  // 配置中间价 
  const middlewares = [
    crashReporter, 
    thunk,
    promise,
    timestamp,
    timeoutScheduler,
    (globalThis.env && globalThis.env === 'development') ? logger : false
  ].filter(Boolean);

  const middlewareEnhancer = applyMiddleware(middlewares); 

  const enhancer = monitorReducers
    ? compose(middlewareEnhancer, monitorReducers) 
    : middlewareEnhancer;

  const Store = new Proxy(State, {
    get: function(target, property, receiver) {
      if ('currentReducer' === property) {
        if (this[REDUCER] == null)  {
          this[REDUCER] = combineReducers(reducers);
        }

        return this[REDUCER];
      }


      if ('getState' === property) {
        return function () {
          if (isDispatching) {
            throw new Error(
              'You may not call store.getState() while the reducer is executing. ' + 
              'The reducer has already received the state as an argument. ' + 
              'Pass it down from the top reducer instead of reading it from the store.'
            );
          }

          // read value from currentState
          return getIn.apply(target, arguments);
        }
      } // end of getState property


      if ('subscribe' === property) {
        return (listener) => {
          if (typeof listener !== 'function') {
            throw new Error('Expected the listener to be a function.');
          }

          if (this.isDispatching) {
            throw new Error(
              'You may not call store.subscribe() while the reducer is executing.'
            );
          }

          let isSubscribed = true;

          //
          this.ensureCanMutateNextListeners();

          this.nextListeners.push(listener);

          // unsubscribe
          return () => {
            if (!isSubscribed) { return; }

            if (this.isDispatching) {
              throw new Error(
                'You may not unsubscribe from a store listener while the reducer is executing. '
              );
            }

            isSubscribed = false;
            ensureCanMutateNextListeners();
            const index = nextListeners.indexOf(listener);
            nextListeners.splice(index, 1);
          }
        }
      } // end of subscribe property

      if ('dispatch' === property) {
        return (action) => {
          if (!value(action).isPlainObject) {
            throw new Error(
              'Actions must be plain objects. Use custom middleware for async actions.'
            );
          }

          if (typeof action.type === 'undefined') {
            throw new Error(
              'Actions may not have an undefined "type" property. ' + 
              'Have you misspelled a constant?'
            );
          }

          if (!types.has(action.type)) {
            console.warn(`${action.type} is not a valid action.`);
          }

          if (this.isDispatching) {
            throw new Error('Reducers may not dispatch actions.');
          }

          try {
            this.isDispatching = true;
            this.currentState = this.currentReducer(target, action);
          } finally {
            this.isDispatching = false;
          }

          const listeners = this.currentListeners = this.nextListeners;

          for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
          } 

          return action;
        }
      } // end of dispatch property

      if ('replaceReducer' === property) {
        return (nextReducer) => {
          if (typeof nextReducer !== 'function') {
            throw new Error('Expected the nextReducer to be a function.');
          }

          this.currentReducer = nextReducer;

          this.dispatch({ type: types.REPLACE });

        }
      } // end of replaceReducer

      if ('currentListeners' === property) {
        if (this[LISTENERS] == null)  {
          this[LISTENERS] = [];
        }

        return this[LISTENERS];

      }

      if ('ensureCanMutateNextListeners' === property) {
        return () => {
          if (this.nextListeners === this.currentListeners) {
            this.nextListeners = this.currentListeners.slice();
          }
        }
      }

      return Reflect.get(target, property, receiver);
    }
  });

  Store.dispatch({ type: types.INIT });

  return Store;
}

// test
const state = store();
console.log(state);
