/**
 *
 * logger middleware
 *
 */

let counter = 0;
import { types } from '../actions/types.mjs';

export default store => next => action => {

  const actionType = action.type 
    ? action.type.replace(/\.\w+$/, '')
    : 'UNKNOWN_ACTION_TYPE';

  const actionName = `${actionType}:${types[actionType]}` 

  console.groupCollapsed(actionName);
  console.log('prevState:', store.getState());
  console.info('dispatching:', action);

  let result = next(action); // 执行action

  console.log('newState:', store.getState());
  console.groupEnd();

  return result;
}
