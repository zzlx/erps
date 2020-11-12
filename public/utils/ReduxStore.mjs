/**
 * *****************************************************************************
 * 
 * Redux store
 *
 * 用于管理UI状态
 *
 *
 * @param {object} preload state
 * @param {object} store
 *
 * *****************************************************************************
 */

import assert, { isPlainObject } from './assert.mjs';
import * as reducers from '../reducers/index.mjs';

export default class ReduxStore {
  constructor (state) {
    this.currentState = state;
    this.currentReducer = combineReducers(reducers);
    this.currentListeners = [];
    this.nextListeners = [];
    this.isDispatching = false;

    this.middlewares = [
      crashReporter, 
      thunk,
      promise,
      timeoutScheduler,
      normalization,
      'development' === globalThis.env && logger,
    ].filter(Boolean).map(fn => fn(this));

    this.dispatch = this.dispatch.bind(this);
    this._dispatch = this._dispatch.bind(this);

    // Action处理器
    this._dispatch({ type: 'INIT' }); // 初始化state
  }

  dispatch (action) {
    return compose.apply(null, this.middlewares)(this._dispatch)(action);
  }

  /**
   * dispatch action
   */

  _dispatch (action) {

    assert(isPlainObject(action), 
      'Actions must be plain objects. Use custom middleware for async actions.');

    assert(!this.isDispatching, 
      'Reducers may not dispatch actions while another one.');

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
   *
   *
   * @param {object} projection
   * @return {object} state
   */

  getState(projection) {
    assert(!this.isDispatching,
      'You may not call store.getState() while the reducer is executing. ' + 
      'The reducer has already received the state as an argument. ' + 
      'Pass it down from the top reducer instead of reading it from the store.'
    );

    if (projection == null) return this.currentState;

    const retval = {};

    for (const key of Object.keys(projection)) {
      if (this.currentState[key]) retval[key] = this.currentState[key];
    }

    return retval;
  }

  subscribe(listener) {
    assert(typeof listener === 'function', 
      'Expected the listener to be a function.');
    assert(!this.isDispatching, 
      'Can not call store.subscribe() while the reducer is executing.');

    let isSubscribed = true;

    this.ensureCanMutateNextListeners();

    this.nextListeners.push(listener);

    // unsubscribe
    return () => {
      if (!this.isSubscribed) { return; }
      assert(!this.isDispatching, 
          'You may not unsubscribe a listener while the reducer is executing.');
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
 * crashReporter middleware
 */

const crashReporter = store => next => action => {
  try {
    return next(action);
  } catch (err) {
    console.error('Action crashed: ', err);
  }
}

/**
 * Lets you dispatch a function instead of an action.
 * This function will receive `dispatch` and `getState` as arguments.
 * Useful for early exits (conditions over `getState()`), as well
 * as for async control flow (it can `dispatch()` something else).
 *
 * `dispatch` will return the return value of the dispatched function.
 */

const thunk = store => next => action => {
  if (action == null) throw new TypeError('Action must not be null.');
  if (typeof action === 'function') return action(store);
  if (typeof action === 'object') return next(action);
  throw new TypeError('Action must not be null.');
}

/**
 * promise middleware
 */

const promise = store => next => action => {
  const isPromise = v => v && typeof v.next === 'function';
  // promise action
  if (isPromise(action)) return action.then(result => next(result)); 

  // promise payload
  if (action && isPromise(action.payload)) {
    return action.payload.then(
      result => {
        next(Object.assign({}, action, { payload: result }));
      },
      error  => {
        next(Object.assign({}, action, { payload: error, error: true,}));
      }
    );
  }

  return next(action); 
}

/**
 * Scheduler actions with { meta: { delay: N } } to be delayed by N milliseconds.
 * Makes `dispatch` return a function to cancel the timeout. 
 */

const timeoutScheduler = store => next => action => {
  if (action && action.meta && action.meta.delay) {

    const timeout = setTimeout(
      () => next(action),
      action.meta.delay
    );

    return () => clearTimeout(timeout);
  }

  return next(action);
}

/**
 * add timestamp to action.meta.timestamp
 */

const timestamp = store => next => action => {
  if (action) {

    const newAction = Object.assign({}, action, {
      meta: Object.assign({}, action.meta, { timestamp: Date.now() })
    });

    return next(newAction);
  }

  return next(action);
}

/**
 * 标准化action
 */

const normalization = store => next => action => {
  const { type, meta, payload, error, ...rests } = action;
  const newAction = Object.create(null);
  newAction.type = type || 'Unknown_Action';
  newAction.payload = Object.assign({}, payload, rests);
  if (meta) newAction.meta = meta;
  if (error) newAction.error = error;

  return next(newAction);
}

/**
 * logger middleware
 */

const logger = store => next => action => {
  console.group('Action');
  console.log('State_Prev:', store.getState());
  console.info('Dispatching action:', action);
  const result = next(action);
  console.log('State_New:', store.getState());
  console.groupEnd();
  return result;
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
 * @param {array} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions from right to left. 
 */

export function compose() {
  const functions = Array.prototype.slice.call(arguments);

  for (const fn of functions) {
    assert('function' === typeof fn, 'Must be compose of functions.');
  }

  return functions.reduce((a, b) => (...args) => a(b(...args)));
}

/**
 * combine reduces
 */

export function combineReducers (reducers) {

  return function combined (state = Object.create(null), action) {
    let hasChanged = false;
    const newState = {};

    for (const key of Object.keys(reducers)) {
      const reducer = reducers[key];
      assert(typeof reducer === 'function', `${key} is not a function!`);
      const previousStateForKey = state[key];
      const newStateForKey = reducer(previousStateForKey, action);
      newState[key] = newStateForKey;
      hasChanged = hasChanged || newStateForKey !== previousStateForKey;
    }

    return hasChanged ? newState : state;
  }
}
