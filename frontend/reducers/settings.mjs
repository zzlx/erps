/**
 * *****************************************************************************
 *
 * 系统设置
 *
 * *****************************************************************************
 */

import { types } from '../actions/index.mjs';
import path from '../utils/path.mjs';

const defaultState = {
  rootURL: path.dirname(path.dirname(path.dirname(path.dirname(import.meta.url))))
};

export default (state = defaultState, action) => {
  if(!action) return state;
  switch(action.type){ 
    case types.LOGIN_SUCCESS: 
      return action.payload; 
    default: 
      return state;
  }
}
