/**
 * *****************************************************************************
 *
 * crashReporter middleware
 *
 * *****************************************************************************
 */

export const crashReporter = store => next => action => {
  try {
    return next(action);
  } catch (err) {
    console.error("Action crashed: ", err);
  }
}
