/**
 * *****************************************************************************
 *
 * Action types
 *
 * *****************************************************************************
 */

export const types = {
  "GET_CONFIGURATION": "...",
  "GET_API_ADDRESS": "获取API地址",
  "GRAPHQL_QUERY": "执行graphql查询",
  "GRAPHQL_QUERY_RESULT": "获取到graphql结果",
  "SET_API_ADDRESS": "设置API地址",
  "REPLACE": "Replace reducer action",
  "SET_PAGE_FOOTER": "设置页脚数据",
  "SAVE_DATA": "保存数据",
  "ACTION_ERROR": "动作错误",
  "ACTION_TYPE_ERROR": "动作类型错误",
  "DATA_READ_FROM_FILE": "DATA_READ_FROM_FILE",
  "DATA_UPDATE": "数据更新",
  "DRAG": "拖动操作",
  "DROP": "放入操作",
  "GRAPHQL_API_QUERY": "执行GRAPHQL API查询.",
  "GRAPHQL_API_REVEIVE_DATA": "收到GRAPHQL_API返回数据.",
  "HISTORY_PUSH_STATE": "无状态刷新",
  "HISTORY_REDIRECT": "页面重定向",
  "INIT": "系统初始化.",
  "LOCK_SCREEN": "锁屏",
  "LOGOUT": "退出登录",
  "MATRIX": "MATRIX",
  "MODAL_CLOSE": "MODAL_CLOSE",
  "MODAL_OPEN": "MODAL_OPEN",
  "MOVE_BLOCK": "MOVE_BLOCK",
  "MUTATION": "MUTATION",
  "NEXT_BLOCK": "NEXT_BLOCK",
  "PROBE_UNKNOWN_ACTION": "PROBE_UNKNOWN_ACTION",
  "PROFILES_THEME_UPDATE": "更新主题",
  "PROMISE_ACTION_PROCESS": "PROMISE_ACTION_PROCESS",
  "PROMISE_ACTION_SUCCESS": "PROMISE_ACTION_SUCCESS",
  "READ_DATA_FORM_CSV": "READ_DATA_FROM_CSV",
  "RECEIVE_DATA": "RECEIVE_DATA",
  "SET_VISIBILITY_FILTER": "SET_VISIBILITY_FILTER",
  "ZZZ": "休眠"
}

// 
const SN = Math.random().toString(16).substring(7);

const randomTypes = {};

// add random string with types
for (let action of Object.keys(types)) { 
  randomTypes[action] = `${action}.${SN}`;
} 

export default randomTypes;
