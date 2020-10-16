/**
 * *****************************************************************************
 * 
 * Creates a Store that holds the state tree.
 *
 *
 * *****************************************************************************
 */

import { types } from '../actions/index.mjs';
import getIn from '../utils/getIn.mjs';
import compose from './compose.mjs';
import assert from '../utils/assert.mjs';
import reducer from '../reducers/index.mjs';
import M from './middlewares.mjs';
const $$observable = Symbol('observable');

export default function getStore (preloadedState = {}) {
  const middlewares = [
    M.crashReporter, 
    M.thunk,
    M.promise,
    M.timeoutScheduler,
    globalThis.env === 'development' ? M.logger : false,
  ].filter(Boolean);

  const store = Object.create(null);

  Object.defineProperties(store, {
    currentState: { value: preloadedState, writable: true, enumerable: true },
    currentReducer: { value: reducer, writable: true, enumerable: false },
    currentListeners: { value: [], writable: true, enumerable: false },
    nextListeners: { value: [], writable: true, enumerable: false },
    isDispatching: { value: false, writable: true, enumerable: false },
    types: { value: types, writable: true, enumerable: false },
  });

  store.dispatch = action => dispatch.call(store, action); 
  store.getState = path => getState.call(store, path);
  store.subscribe = cb => subscribe.call(store, cb);
  store.dispatch({ type: types.INIT });

  const storeProxy = new Proxy(store, { 
    get: function (target, property, receiver) {
      if ('replaceReducer' === property) {
        return reducer => replaceReducer.call(target, reducer);
      }
      if ('dispatch' === property) {
        const chain = middlewares.map(m => m(receiver));
        return compose.apply(null, chain)(target.dispatch);
      }

      return Reflect.get(target, property, receiver);
    }
  });

  return storeProxy;
}

function ensureCanMutateNextListeners() {
  if (this.nextListeners === this.currentListeners) {
    this.nextListeners = this.currentListeners.slice();
  }
}

function getState() {
  if (this.isDispatching) {
    throw new Error(
      'You may not call store.getState() while the reducer is executing. ' + 
      'The reducer has already received the state as an argument. ' + 
      'Pass it down from the top reducer instead of reading it from the store.'
    );
  }

  // read value from currentState
  return getIn.apply(this.currentState, arguments);
}

function subscribe(listener) {
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
  ensureCanMutateNextListeners.call(this);

  this.nextListeners.push(listener);

  // unsubscribe
  return () => {
    if (!this.isSubscribed) { return; }

    if (this.isDispatching) {
      throw new Error(
        'You may not unsubscribe from a store listener while the reducer is executing. '
      );
    }

    this.isSubscribed = false;
    ensureCanMutateNextListeners.call(this);
    const index = this.nextListeners.indexOf(listener);
    this.nextListeners.splice(index, 1);
  };
}

function dispatch (action) {
  if (!assert.isPlainObject(action)) {
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

  if (!this.types.has(action.type)) {
    console.warn(`${action.type} is not a valid action.`);
  }

  if (this.isDispatching) throw new Error('Reducers may not dispatch actions.');

  try {
    this.isDispatching = true;
    this.currentState = this.currentReducer(this.currentState, action);
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
 * load some of the reducers dynamically. You might also need this if you
 * implement a hot reloading mechanism for Redux.
 *
 * @param {Function} nextReducer The reducer for the store to use instead.
 * @returns {void}
 */

function replaceReducer(nextReducer) {
  if (typeof nextReducer !== 'function') {
    throw new Error('Expected the nextReducer to be a function.');
  }

  this.currentReducer = nextReducer;
  dispatch.call(this, { type: types.REPLACE });
}
