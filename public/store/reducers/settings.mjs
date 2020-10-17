/**
 * *****************************************************************************
 *
 * 配置信息
 *
 * *****************************************************************************
 */

const defaultState = {
};

export default (state = defaultState, action) => {
  switch(action.type){ 
    case 'LOGIN_SUCCESS': 
      return action.payload; 
    default: 
      return state;
  }
}
