/**
 * *****************************************************************************
 * 
 * Redux Store middlewares
 *
 * *****************************************************************************
 */

import assert from '../../utils/assert.mjs';
export { default as websocket } from './websocket.mjs'

/**
 * crashReporter middleware
 */

export const crashReporter = store => next => action => {
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

export const thunk = store => next => action => typeof action === 'function'
  ? action(store)
  : next(action);

/**
 * promise middleware
 */

export const promise = store => next => action => {
  // promise action
  if (assert.isPromise(action)) return action.then(result => next(result)); 

  // promise payload
  if (action && assert.isPromise(action.payload)) {
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

export const timeoutScheduler = store => next => action => {
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

export const timestamp = store => next => action => {
  if (action) {

    const newAction = Object.assign({}, action, {
      meta: Object.assign({}, action.meta, { timestamp: Date.now() })
    });

    return next(newAction);
  }

  return next(action);
}

/**
 * 
 *
 */

export const normalization = store => next => action => {
  const { type, meta, payload, error, ...rests } = action;
  const newAction = Object.create(null);
  if (meta) newAction.meta = meta;
  if (error) newAction.error = error;
  newAction.type = type || 'Unknown_Action';
  newAction.payload = payload;
  return next(newAction);
}

/**
 * logger middleware
 */

export const logger = store => next => action => {
  console.groupCollapsed('Dispatch:', action);
  console.log('prevState:', store.getState());
  const result = next(action);
  console.log('newState:', store.getState());
  console.groupEnd();
  return result;
}
