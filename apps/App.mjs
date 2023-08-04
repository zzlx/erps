/**
 * *****************************************************************************
 *
 *  Frontend User Interface Application
 *
 *  用于提供用户操作界面,通过UI APP 交互后端数据
 *
 * @todos: 
 * * pv统计/API调用量统计
 *
 * *****************************************************************************
 */

import Provider from "./components/Provider.mjs";
import React from "./components/React.mjs";
import { routes } from "./routes.mjs";
import { createStore } from "./store/createStore.mjs"; 

export default function App (props) {
  const data = props.data;
  const store = createStore(data);

  store.dispatch({type: "TEST", payload: "开始构建前端界面"});

  return React.createElement(Provider, { store: store }, routes);
}
