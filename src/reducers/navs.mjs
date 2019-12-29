/**
 * 管理nav数据状态
 *
 *
 *
 *
 *
 *
 */

import { types } from '../actions/index.mjs';
import initialState from '../data/navs.json';

export default (state = initialState, action) => {
  switch (action.type) {
    case types.QUERY_NAVS:
    case types.REVEIVE_NAVS:
      return Object.assign({}, state, action.payload.stats);
    default:
      return state;
  }
}

/**
 * 设置活动项
 *
 */

function setActive (state) {
  // 获取active项目
  for (let item of state) {

  }
}
