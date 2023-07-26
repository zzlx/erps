/**
 * *****************************************************************************
 *
 * logger middleware
 *
 * *****************************************************************************
 */

export const logger = store => next => action => {
  console.group(`${action.type}: ${action.payload ? action.payload : ""}`);
  console.log("prevState:", store.getState());

  const result = next(action);

  console.log("newState:", store.getState());
  console.groupEnd();

  return result;
};
