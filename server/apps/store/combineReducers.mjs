/**
 * *****************************************************************************
 *
 * combine reduces
 *
 * *****************************************************************************
 */

export function combineReducers (reducers) {

  return function combined (state = Object.create(null), action) {
    let hasChanged = false;
    const newState = {};

    for (const key of Object.keys(reducers)) {
      const reducer = reducers[key];

      if (typeof reducer !== "function") {
        throw new Error(`${key} is not a function!`);
      }

      const previousStateForKey = state[key];
      const newStateForKey = reducer(previousStateForKey, action);
      newState[key] = newStateForKey;
      hasChanged = hasChanged || newStateForKey !== previousStateForKey;
    }

    return hasChanged ? newState : state;
  };
}
