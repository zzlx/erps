/**
 * *****************************************************************************
 *
 * Lets you dispatch a function instead of an action.
 * This function will receive `dispatch` and `getState` as arguments.
 * Useful for early exits (conditions over `getState()`), as well
 * as for async control flow (it can `dispatch()` something else).
 *
 * `dispatch` will return the return value of the dispatched function.
 *
 * *****************************************************************************
 */

export default store => next => action => {

  if (action && typeof action === 'function') {
    return action(store); // 传入store对象
  }

  if (action && typeof action === 'object') {
    return next(action);
  }

  throw new Error('Action must be a plain object.');
}
