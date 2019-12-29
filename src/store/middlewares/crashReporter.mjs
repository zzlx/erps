/**
 * crashReporter
 *
 */

export default store => next => action => {
  try {
    return next(action);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Action crashed: ', err);
    }
  }
}
