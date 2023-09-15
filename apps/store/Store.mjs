/**
 * *****************************************************************************
 * 
 * Store creater
 *
 * *****************************************************************************
 */

import { compose } from "./compose.mjs";
import { assert } from "../utils/assert.mjs";
import { isPlainObject } from "../utils/is/isPlainObject.mjs";

/**
 * Redux Store
 *
 * @param {object} preload state
 * @return {object} store
 */

export class Store {
  constructor (state) {
    this.currentState = state;
    this.currentReducer = (state, action) => state;
    this.currentListeners = [];
    this.nextListeners = [];
    this.middlewares = [];
    this.isDispatching = false;
  }
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

Store.prototype.replaceReducer = function replaceReducer (nextReducer) {
  if (typeof nextReducer !== "function") {
    throw new Error("Expected the nextReducer to be a function.");
  }

  this.currentReducer = nextReducer;
  this.dispatch({ type: "REPLACE_REDUCER" });
};

/**
 *
 *
 */

Store.prototype.ensureCanMutateNextListeners = function () {
  if (this.nextListeners === this.currentListeners) {
    this.nextListeners = this.currentListeners.slice();
  }
};

/**
 * dispacth action
 */

Store.prototype.dispatch = function dispatch (action) {
  assert(isPlainObject(action), 
    "Actions must be plain objects. Use custom middleware for async actions.");

  assert(!this.isDispatching, 
    "Reducers may not dispatch actions while another one.");

  try {
    this.isDispatching = true;
    this.currentState = this.currentReducer(this.currentState, action); 
  } catch (e) { 
    console.error(e);
  } finally {
    this.isDispatching = false;
  } 

  const listeners = this.currentListeners = this.nextListeners;
  for (const listener of listeners) listener();

  const composedFn = Reflect.apply(compose, null, this.middlewares);
  return composedFn(action);
};

Store.prototype.init = function init () {
  this.dispatch({ type: "INIT" });
  return this;
};

/**
 * get state from curentState
 *
 * @param {string} key
 * @return {object}
 */

Store.prototype.getState = function getState () {
  assert(!this.isDispatching,
    "You may not call store.getState() while the reducer is executing. " + 
    "The reducer has already received the state as an argument. " + 
    "Pass it down from the top reducer instead of reading it from the store.",
  );

  let retval = this.currentState;

  for (const key of arguments) {
    // retrive value
    retval = retval[key];

    // break this loop
    if (retval === undefined ) break;
  }

  return retval;
}

/**
 * subscribe listener
 *
 */

Store.prototype.subscribe = function subscribe (listener) {
  assert(typeof listener === "function", "Listener is expected a function.");
  assert(!this.isDispatching, 
    "Can not call store.subscribe() while the reducer is executing.");

  this.isSubscribed = true;

  this.ensureCanMutateNextListeners();

  this.nextListeners.push(listener);

  // unsubscribe
  return () => {
    if (!this.isSubscribed) { return; }
    assert(!this.isDispatching, "You may not unsubscribe a listener while the reducer is executing.");
    this.isSubscribed = false;
    this.ensureCanMutateNextListeners();
    const index = this.nextListeners.indexOf(listener);
    this.nextListeners.splice(index, 1);
  };
}

