/**
 * handle location state
 *
 */

import { types } from '../actions/index.mjs';

const initialState = {
  pathname: '/'
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.HISTORY_PUSH_STATE:
      if (state.pathname === action.payload.pathname) return state;
      return Object.assign({}, state, {pathname: action.payload.pathname});
    default: 
      return state;
  }
}
