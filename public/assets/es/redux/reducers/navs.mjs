/**
 *
 * 管理nav数据状态
 *
 *
 *
 *
 *
 *
 */

const initialState = [
  {name: 'HomePage', url: '/HomePage', active: true},
  {name: 'About', url: '/HomePage', active: false},
];

export const navs = (state = initialState, action) => {
  switch (action.type) {
    case 'QUERY_NAVS':
    case 'REVEIVE_NAVS':
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
