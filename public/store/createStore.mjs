/**
 * *****************************************************************************
 * 
 * 前端应用状态管理器
 *
 * *****************************************************************************
 */

import { ok, isPlainObject } from '../utils/assert.mjs';
import M from './middlewares.mjs';
import { types } from './actions/index.mjs';
import * as reducers from './reducers/index.mjs';

export default function createStore(preloadedState = {}) {

  const store = new StateManager(preloadedState);

  const middlewares = [
    M.crashReporter, 
    M.thunk,
    M.promise,
    M.timeoutScheduler,
    globalThis.env === 'development' && M.logger,
  ].filter(Boolean);

  return new Proxy(store, { 
    get: function (target, property, receiver) {
      if ('dispatch' === property) {
        const chain = middlewares.map(m => m(receiver));
        return compose.apply(null, chain)(target.dispatch);
      }

      return Reflect.get(target, property, receiver);
    }
  });
}

/**
 * Store对象
 */

class StateManager {
  constructor (state) {
    this.currentState = state;
    this.currentReducer = combineReducers(reducers);
    this.currentListeners = [];
    this.nextListeners = [];
    this.isDispatching = false;
    this.types = types;

    this.dispatch = this.dispatch.bind(this);
    this.dispatch({ type: 'INIT' }); // 初始化state
  }

  getState() {
    if (this.isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' + 
        'The reducer has already received the state as an argument. ' + 
        'Pass it down from the top reducer instead of reading it from the store.'
      );
    }

    let value = this.currentState;
    const paths = Array.prototype.slice.call(arguments);
    for (let path of paths) if (null == (value = value[path])) break;
    return value;
  }

  subscribe(listener) {
    ok(typeof listener === 'function', 'Expected the listener to be a function.');
    ok(!this.isDispatching, 
      'Can not call store.subscribe() while the reducer is executing.');

    let isSubscribed = true;

    this.ensureCanMutateNextListeners();

    this.nextListeners.push(listener);

    // unsubscribe
    return () => {
      if (!this.isSubscribed) { return; }
      ok(!this.isDispatching, 
          'You may not unsubscribe a listener while the reducer is executing.');
      this.isSubscribed = false;
      this.ensureCanMutateNextListeners();
      const index = this.nextListeners.indexOf(listener);
      this.nextListeners.splice(index, 1);
    };
  }

  dispatch (action) {
    ok(isPlainObject(action), 
      'Actions must be plain objects. Use custom middleware for async actions.');

    ok(typeof action.type !== 'undefined', 
      'Actions may not have an undefined "type" property. ' + 
      'Have you misspelled a constant?');

    ok(this.types.has(action.type), `Action type ${action.type} is not defined.`);

    ok(!this.isDispatching, 'Reducers may not dispatch actions while another one.');

    try {
      this.isDispatching = true;
      this.currentState = this.currentReducer(this.currentState, action); 
    } catch (e) { 
      console.error(e) 
    } finally {
      this.isDispatching = false;
    } 

    const listeners = this.currentListeners = this.nextListeners;
    for (let listener of listeners) listener();

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. 
   * You might also need this if you implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */

  replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    this.currentReducer = nextReducer;
    this.dispatch({ type: 'REPLACE_REDUCER' });
  }

  ensureCanMutateNextListeners() {
    if (this.nextListeners === this.currentListeners) {
      this.nextListeners = this.currentListeners.slice();
    }
  }
}

/**
 * Composes single-argument functions from right to left. 
 *
 * The rightmost function can take multiple arguments 
 * as it provides the signature for the resulting composite function.
 *
 * For example:
 * compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
 *
 * @param {function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions from right to left. 
 */

export function compose() {
  const functions = Array.prototype.slice.call(arguments)

  for (let fn of functions) {
    if (typeof fn !== 'function') {
      throw new TypeError('Must be compose of functions.');
    }
  }

  return functions.reduce((a, b) => (...args) => a(b(...args)));
}

/**
 * combine reduces
 */

export function combineReducers (reducers) {
  return function combinedReducer (state = Object.create(null), action) {
    let hasChanged = false;
    const newState = {};

    for (const key of Object.keys(reducers)) {
      const reducer = reducers[key];

      const previousStateForKey = state[key];

      if (typeof reducer !== 'function') {
        throw new Error(`${key} reducer is not a function!`);
      }

      const newStateForKey = reducer(previousStateForKey, action);
      newState[key] = newStateForKey;
      hasChanged = hasChanged || newStateForKey !== previousStateForKey;
    }

    return hasChanged ? newState : state;
  }
}
