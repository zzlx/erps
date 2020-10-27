/**
 * *****************************************************************************
 *
 * 前端配置信息
 *
 * 支持配置项目
 *
 * *****************************************************************************
 */

const initialState = [
  { type: 'theme', breakpoint: 'md', },
];

export default (state = initialState, action) => {
  switch(action.type){ 
    case 'LOGIN_SUCCESS': 
      return action.payload; 
    default: 
      return state;
  }
}
