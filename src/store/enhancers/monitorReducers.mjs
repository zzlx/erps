/**
 * Reducer enhancer
 *
 */

export default createStore => (reducer, preloadedState, enhancer) => {

  const newReducer = (state, action) => {
    const timer = 'Reducer take time';
    console.time(timer);
    const newState = reducer(state, action);
    console.timeEnd(timer);
    return newState;
  }

  return createStore(newReducer, preloadedState, enhancer);
}
