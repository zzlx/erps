/**
 * 
 *
 */

import { types } from '../actions/index.mjs';

export default (state = {}, action) => {
  switch(action.type){
    case types.GRAPHQL_QUERY:
      if (action.payload.data) return action.payload.data;
      return state;
    default:
      return state;
  }
}
