/**
 * crashReporter
 *
 */

export default store => next => action => {
  try {
    return next(action);
  } catch (err) {
    if (env && env === 'development') {
      console.error('Action crashed: ', err);
    }
  }
}
