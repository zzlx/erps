/**
 * *****************************************************************************
 * 
 * Action标准化
 *
 * *****************************************************************************
 */

export const normalization = store => next => action => {
  const { type, meta, payload, error, ...rests } = action;
  const newAction = Object.create(null);
  if (meta) newAction.meta = meta;
  if (error) newAction.error = error;
  newAction.type = type || "Unknown_Action";
  newAction.payload = payload ? payload : { ...rests };
  return next(newAction);
}
