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

export const thunk = store => next => action => typeof action === "function"
  ? action(store)
  : next(action);
