/**
 * 
 *
 */

export default (state = {}, action) => {
  switch(action.type){
    case 'GRAPHQL_QUERY':
      if (action.payload.data) return action.payload.data;
      return state;
    default:
      return state;
  }
}
