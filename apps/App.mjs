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

// load components
import Provider from "./components/Provider.mjs";
//import Html from "./components/Html.mjs";
import React from "./components/React.mjs";
import Switcher from "./components/Switcher.mjs";
import Route from "./components/Route.mjs";
import { createStore } from "./store/createStore.mjs"; 


// import lazy from "./components/lazy.mjs";
// import * as layout from "./components/layout/index.mjs";
import HomePage from "./pages/HomePage.mjs";
import Test from "./pages/Test1.mjs";
import NoMatch from "./pages/NoMatch.mjs";

export default function App (props) {
  const data = props.data;
  const store = createStore(data);
  //store.dispatch({type: "TEST", payload: "开始构建前端界面"});

  // const Comp = React.lazy(() => import(`./modules/OtherComponent`));

  // test store
  //store.dispatch({type: "TEST"});
  // store.dispatch({ type: "WEBSOCKET_SEND", payload: "test" })

  const routes = React.createElement(Switcher, null, 
    React.createElement(Route, { 
      path: ["/", "/homepage"], 
      exact: true, 
      component: HomePage, 
    }),
    React.createElement(Route, { path: "*", component: NoMatch }),
  );

  /*
  const pageInfo = store.getState("pageInfo");

  const html = React.createElement(Html, { 
    isSSR: store.getState("isSSR"), 
    initialState: JSON.stringify(props),
    ...pageInfo
  }, routes);
  */

  return React.createElement(Provider, { store: store }, routes);
}
