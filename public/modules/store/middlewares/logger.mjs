/**
 * logger middleware
 *
 */

let counter = 0;

export default store => next => action => {
  console.groupCollapsed(action.type || 'UNKNOWN_ACTION_TYPE');
  console.log('prevState:', store.getState());
  console.info('dispatching:', action);
  let result = next(action);
  console.log('newState:', store.getState());
  console.groupEnd();

  return result;
}
