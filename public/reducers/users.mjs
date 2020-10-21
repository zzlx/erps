/**
 *
 */

const initState = [{"id": 0, "username": "anonymous"}];

export default (state = initState, action) => {
  if(!action) return state;
  switch(action.type){ 
    case 'LOGIN_SUCCESS': 
      return action.payload; 
    default: 
      return state;
  }
}
