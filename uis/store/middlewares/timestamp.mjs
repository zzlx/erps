/**
 * *****************************************************************************
 *
 * add timestamp to action.meta.timestamp
 *
 * *****************************************************************************
 */

export const timestamp = store => next => action => {
  if (action) {

    const newAction = Object.assign({}, action, {
      meta: Object.assign({}, action.meta, { timestamp: Date.now() })
    });

    return next(newAction);
  }

  return next(action);
}
