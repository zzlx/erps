/**
 *
 * logger middleware
 *
 */

let counter = 0;

export default store => next => action => {

  const actionName =  action.type || 'UNKNOWN_ACTION_TYPE';

  console.groupCollapsed(actionName);
  console.log('prevState:', store.getState());
  console.info('dispatching:', action);

  let result = next(action); // 执行action

  console.log('newState:', store.getState());
  console.groupEnd();

  return result;
}
