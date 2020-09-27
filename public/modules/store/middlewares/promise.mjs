/**
 * *****************************************************************************
 *
 * promise middleware
 *
 * *****************************************************************************
 */

import is from '../../utils/is.mjs';

export default store => next => action => {
  // promise action
  if (is(action).promise) return action.then(result => next(result)); 

  // promise payload
  if (action && is(action.payload).promise) {
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
