/**
 * *****************************************************************************
 *
 *  Frontend User Interface Application
 *
 * *****************************************************************************
 */

import Provider from "./components/Provider.mjs";
import Switcher from "./components/Switcher.mjs";
import React from "./components/React.mjs";
import Route from "./components/Route.mjs";
import { routes } from "./routes.mjs";
import { createStore } from "./store/createStore.mjs"; 

/**
 * 前端程序
 *
 * 用于提供用户操作界面,通过UI APP 交互后端数据
 *
 * @params {props.data} object
 * @return react element
 */

export default function App (props) {
  // 构造存储器
  const store = createStore(props.data);

  // 前端路由器
  const router = React.createElement(Switcher, null, 
    routes.map((r,i) => React.createElement(Route, { key: i, ...r })),
  );
  
  // 输出前端组件
  return React.createElement(Provider, { store: store }, router);
}
