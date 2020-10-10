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

import assert from '../../utils/assert.mjs';

export default store => next => action => {
  assert(action, 'Action must not be null.');

  if (typeof action === 'function') return action(store);
  if (typeof action === 'object') return next(action);

  assert(0, 'Action must be a plain object.');
}
