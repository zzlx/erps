/**
 *
 */

import object from '../utils/object.mjs';
import { types } from '../actions/index.mjs';

const profiles = {
  api_address: null,
  themes: ['primary', 'secondary', 'success', 'info', 'warning', 'light', 'dark'],
  theme: 'primary',
  userName: 'anonymous',
}

export default (state = profiles, action) => {
  switch(action.type){
    case types.GET_API_ADDRESS:
      return Object.assign({}, state, {api_address: action.payload.api_address}); 
    case types.PROFILES_THEME_UPDATE:
      const newTheme = action.payload || 'secondary';
      return Object.assign({}, state, {theme: newTheme});
    case types.PROFILES_THEME_UPDATE:
      return state;
    case types.SET_PAGE_FOOTER:
      return Object.assign({}, state, {footer: action.payload});
    case types.LOGIN_SUCCESS:
      return action.payload.id;
    case types.LOGOUT:
    case types.GRAPHQL_API_QUERY:
      if (!action.payload) return state;
      if (object.getIn.apply(action.payload.data, ['docs'])) {
        return Object.assign({}, state, {
          welcome: action.payload.data.docs,
        });
      }
      return state;
    default: 
    return state;
  }
}
