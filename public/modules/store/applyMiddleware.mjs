/**
 * *****************************************************************************
 *
 * Creates a store enhancer that applies middleware to Redux store dispatch method.
 * This is handy for a variety of tasks, 
 * such as expressing asynchronous actions in a concise manner, or log action payload.
 *
 * Because middleware is potentially asynchronous, 
 * this should be the first store enhancer in the composition chain.
 *
 * Note:
 * Each middleware will be given `dispatch` and `getState` functions as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 * *****************************************************************************
 */

import compose from './compose.mjs';

export default function applyMiddleware(middlewares) {

  return createStore => (...args) => {

    const store = createStore(...args);

    let _dispatch = () => {
      throw new Error(
        "Dispatching while constructing your middleware is not allowed. " + 
        "Other middleware would not be applied to this dispatch."
      );
    };

    const middlewareAPI = {
      types: store.types,
      getState: store.getState,
      dispatch: (...args) => _dispatch(...args)
    };

    // constructing middleware chain
    const chain = middlewares.map(middleware => middleware(middlewareAPI));

    _dispatch = compose.apply(void 0, chain)(store.dispatch);

    return Object.assign({}, store, { dispatch: _dispatch });
  }
}
