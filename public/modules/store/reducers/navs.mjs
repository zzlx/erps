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

const initialState = [
  {name: 'HomePage', url: '/HomePage', active: true},
  {name: 'About', url: '/HomePage', active: false},
];

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
