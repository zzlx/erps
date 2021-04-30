/**
 * *****************************************************************************
 *
 * logger middleware
 *
 * *****************************************************************************
 */

export const logger = store => next => action => {

  console.group(`Dispatch: ${action.type}`);
  console.log('prevState:', store.getState());
  const result = next(action);
  console.log('action:', action);
  console.log('newState:', store.getState());
  console.groupEnd();

  return result;
}
