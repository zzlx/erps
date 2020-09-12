/**
 * *****************************************************************************
 *
 * logger middleware
 *
 * *****************************************************************************
 */

export default store => next => action => {
  const type = store.types.getType(action.type);
  console.group(`${action.type}_${type.desc}`);
  console.log('state_prev:', store.getState());
  console.info('dispatching:', action);

  const result = next(action);

  console.log('state_new:', store.getState());
  console.groupEnd();

  return result;
}
