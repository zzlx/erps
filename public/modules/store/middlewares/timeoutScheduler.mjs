/**
 * Scheduler actions with { meta: { delay: N } } to be delayed by N milliseconds.
 * Makes `dispatch` return a function to cancel the timeout. 
 *
 */

export default store => next => action => {
  if (action && action.meta && action.meta.delay) {
    const timeoutId = setTimeout(
      () => next(action),
      action.meta.delay
    );
    return () => clearTimeout(timeoutId);
  }

  return next(action);
}
