/**
 * *****************************************************************************
 *
 * Redux 中间件
 *
 * *****************************************************************************
 */


/**
 * crashReporter middleware
 */

const crashReporter = store => next => action => {
  try {
    return next(action);
  } catch (err) {
    if (console && console.error) {
      console.error('Action crashed: ', err);
    }
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
 * logger middleware
 */

const logger = store => next => action => {
  const type = store.types.getType(action.type);

  console.group(`${action ? action.type : 'Unknown Action'}_${type.desc}`);
  console.log('state_prev:', store.getState());
  console.info('dispatching:', action);

  const result = next(action);

  console.log('state_new:', store.getState());
  console.groupEnd();

  return result;
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

export default {
  crashReporter,
  logger,
  promise,
  thunk,
  timeoutScheduler,
  timestamp,
}
