/**
 * *****************************************************************************
 *
 * promise middleware
 *
 * *****************************************************************************
 */

import value from '../../utils/value.mjs';

export default store => next => action => {
  // promise action
  if (value(action).isPromise) return action.then(result => next(result)); 

  // promise payload
  if (action && value(action.payload).isPromise) {
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
