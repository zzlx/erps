/**
 * *****************************************************************************
 *
 * promise middleware
 *
 * *****************************************************************************
 */

import { isPromise } from "../../utils/is/isPromise.mjs";

export const promise = store => next => action => {
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
