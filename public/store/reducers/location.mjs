/**
 * handle location state
 *
 */

const initialState = {
  pathname: '/'
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'HISTORY_PUSH_STATE':
      if (state.pathname === action.payload.pathname) return state;
      return Object.assign({}, state, {pathname: action.payload.pathname});
    default: 
      return state;
  }
}
