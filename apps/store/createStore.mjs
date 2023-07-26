/**
 * *****************************************************************************
 * 
 * Store creater
 *
 * *****************************************************************************
 */

import { assert } from "../utils/assert.mjs";
import { isDevel } from "../utils/is/isDevel.mjs";
import { isPlainObject } from "../utils/is/isPlainObject.mjs";
import * as reducers from "../reducers/index.mjs";
// import { actionTypes as types } from "./actionTypes.mjs";
import * as M from "./middlewares/index.mjs";

/**
 * Redux Store
 *
 * @param {object} preload state
 * @return {object} store
 */

export default class Store {
  constructor (state) {
    this.currentState = state;
    this.currentReducer = combineReducers(reducers);
    this.currentListeners = [];
    this.nextListeners = [];
    this.isDispatching = false;

    this.middlewares = [
      M.crashReporter, 
      M.thunk,
      M.promise,
      M.timeoutScheduler,
      M.normalization,
      isDevel() && M.logger,
    ].filter(Boolean).map(fn => fn(this));

    this.dispatch = this.dispatch.bind(this);
    this._dispatch = this._dispatch.bind(this);

    this._dispatch({ type: "INIT" });
  }

  dispatch (action) {
    return compose.apply(null, this.middlewares)(this._dispatch)(action);
  }

  /**
   * dispatch action
   */

  _dispatch (action) {
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
    for (let listener of listeners) listener();

    return action;
  }

  /**
   * get state from curentState
   *
   * @param {string} key
   * @return {object}
   */

  getState() {
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

  subscribe(listener) {
    assert(typeof listener === "function", 
      "Expected the listener to be a function.");
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
    if (typeof nextReducer !== "function") {
      throw new Error("Expected the nextReducer to be a function.");
    }

    this.currentReducer = nextReducer;
    this.dispatch({ type: "REPLACE_REDUCER" });
  }

  ensureCanMutateNextListeners() {
    if (this.nextListeners === this.currentListeners) {
      this.nextListeners = this.currentListeners.slice();
    }
  }
}

/**
 * *****************************************************************************
 *
 * Utilities
 *
 * *****************************************************************************
 */

/**
 * Composes single-argument functions from right to left. 
 *
 * The rightmost function can take multiple arguments 
 * as it provides the signature for the resulting composite function.
 *
 * For example:
 * compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
 *
 * @param {array} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions from right to left. 
 */

export function compose() {
  const functions = Array.prototype.slice.call(arguments);

  for (const fn of functions) {
    assert("function" === typeof fn, "Must be compose of functions.");
  }

  return functions.reduce((a, b) => (...args) => a(b(...args)));
}

/**
 * combine reduces
 *
 */

export function combineReducers (reducers) {

  return function combined (state = Object.create(null), action) {
    let hasChanged = false;
    const newState = {};

    for (const key of Object.keys(reducers)) {
      const reducer = reducers[key];
      assert(typeof reducer === "function", `${key} is not a function!`);
      const previousStateForKey = state[key];
      const newStateForKey = reducer(previousStateForKey, action);
      newState[key] = newStateForKey;
      hasChanged = hasChanged || newStateForKey !== previousStateForKey;
    }

    return hasChanged ? newState : state;
  };
}

export const createStore = state => new Store(state);
