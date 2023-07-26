/**
 * *****************************************************************************
 *
 * Action Types
 * ============
 *
 * *****************************************************************************
 */

// 系统基础Action Types
// @todo 从数据库中获取Action Type后合并
const types = [
  { name: "API_QUERY", desc: "执行API查询" },
  { name: "API_QUERY", desc: "执行API查询" },
  { name: "DRAG", desc: "拖动操作" },
  { name: "DROP", desc: "放入操作" },
  { name: "ERROR", desc: "错误" },
  { name: "ERROR_MESSAGE", desc: "错误消息" },
  { name: "HISTORY_PUSH_STATE", desc: "无状态刷新" },
  { name: "HISTORY_REDIRECT", desc: "页面重定向" },
  { name: "INIT", desc: "系统初始化" },
  { name: "INITIAL_STATE", desc: "." },
  { name: "LOCK_SCREEN", desc: "锁屏" },
  { name: "LOGOUT", desc: "退出登录" },
  { name: "MATRIX", desc: "矩阵" },
  { name: "MODAL_CLOSE", desc: "MODAL_CLOSE" },
  { name: "MODAL_OPEN", desc: "MODAL_OPEN" },
  { name: "MOVE_BLOCK", desc: "MOVE_BLOCK" },
  { name: "MUTATION", desc: "MUTATION" },
  { name: "NEXT_BLOCK", desc: "NEXT_BLOCK" },
  { name: "PROBE_UNKNOWN_ACTION", desc: "未知的Action类型" },
  { name: "PROFILES_THEME_UPDATE", desc: "更新主题" },
  { name: "PROMISE_ACTION_PROCESS", desc: "PROMISE_ACTION_PROCESS" },
  { name: "PROMISE_ACTION_SUCCESS", desc: "PROMISE_ACTION_SUCCESS" },
  { name: "READ_DATA_FORM_CSV", desc: "READ_DATA_FROM_CSV" },
  { name: "RECEIVE_DATA", desc: "RECEIVE_DATA" },
  { name: "REPLACE", desc: "Replace reducer action" },
  { name: "SAVE_DATA", desc: "保存数据" },
  { name: "SAVE_JWT", desc: "保存JWT" },
  { name: "SET_API_ADDRESS", desc: "设置API地址" },
  { name: "SET_PAGE_FOOTER", desc: "设置页脚数据" },
  { name: "SET_VISIBILITY_FILTER", desc: "SET_VISIBILITY_FILTER" },
  { name: "TEST", desc: "测试" },

  // user dispatch action types
  { name: "WEBSOCKET_SEND", desc: "用于发送websocket数据" },

  // event drived action types
  { name: "WEBSOCKET_CLOSED", desc: "" },
  { name: "WEBSOCKET_ERROR", desc: "" },
  { name: "WEBSOCKET_MESSAGE", desc: "接收到websocket服务端消息" },

  { name: "ZZZ", desc: "休眠" },
];

export const actionTypes = new Proxy(types, {
  get: function(target, property, receiver) {
    if (property === "toString") return JSON.stringify(target);
    if (property === "toJSON") return target;

    if (property === "has") {
      return name => {
        let retval = false

        for (let type of target) {
          if (type.name === name) {
            retval = true; 
            break;
          }
        }

        return retval;
      }
    }

    if (property === "getType") {
      return name => {
        let retval = null;

        for (let type of target) {
          if (type.name === name) {
            retval = type;
            break;
          }
        }

        return retval;
      }
    }

    // 直接访问name, 若存在则返回name
    for (let type of target) if (type.name === property) return type.name;

		return Reflect.get(target, property, receiver);
  }
});
