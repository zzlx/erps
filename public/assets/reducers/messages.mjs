/**
 * 
 *
 */

import { types } from '../actions/index.mjs';

export default (state = [], action) => {
  switch(action.type){
    case types.GRAPHQL_QUERY_RESULT:
      if (action.payload.errors && action.payload.errors.length > 0) {
        return action.payload.errors;
      } else {
        return []; // 错误自动清除
      }
    default:
      return state;
  }
}
