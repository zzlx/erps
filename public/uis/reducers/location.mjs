/**
 * *****************************************************************************
 *
 * 管理location
 *
 * *****************************************************************************
 */

const initialState = [
  { pathname: '/' }
];

export default (state = initialState, action) => {
  switch (action.type) {
    case 'HISTORY_PUSH_STATE':

      if (state.pathname !== action.payload.pathname) {

        //if (globalThis.window && typeof window.history === 'object') {
          //window.history.pushState(null, null, action.payload.pathname);
        //}

        return Object.assign({}, state, { pathname: action.payload.pathname });

      } else {
        return state;
      }
    default: 
      return state;
  }
}
