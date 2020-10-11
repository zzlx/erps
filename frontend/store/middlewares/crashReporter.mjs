/**
 * *****************************************************************************
 *
 * crashReporter middleware
 *
 * *****************************************************************************
 */

export default store => next => action => {
  try {
    return next(action);
  } catch (err) {
    if (console && console.error) {
      console.error('Action crashed: ', err);
    }
  }
}
