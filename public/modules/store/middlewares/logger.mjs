/**
 * *****************************************************************************
 *
 * logger middleware
 *
 * *****************************************************************************
 */

let counter = 0;

export default store => next => action => {

  const actionName =  action.type || 'UNKNOWN_ACTION_TYPE';
  const type = store.types.getType(action.type);

  console.group(`Action_${++counter}`);

  console.log('prevState:', store.getState());
  console.info('dispatching:', Object.assign({}, action, {desc: type.desc}));

  let result = next(action); // 执行action

  console.log('newState:', store.getState());
  console.groupEnd();

  return result;
}
