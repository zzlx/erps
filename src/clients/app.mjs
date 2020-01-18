import React from 'react';
import {
  Provider,
  Route,
  Redirect,
  Switch,
} from '../components/index.mjs';
import * as M from '../apps/index.mjs';
import routes from './routes.json'; 

/**
 * User Interfaces application.
 *
 *
 */

// App
const App = function (store) {
  // Router 客户端路由
  const Switcher = React.createElement(Switch, null, routes.map((v, k) => {
    return React.createElement(v.from ? Redirect : Route, { 
      key: k,
      path: v.path,
      title: v.title,
      exact: v.exact,
      from: v.from,
      to: v.to,
    }, M[v.app]);
  }));

  return React.createElement(Provider, { 
    store: store 
  }, Switcher);
}


// Profiler
// 用于开发环境下分析渲染性能
const Profiler = (store) => React.createElement(React.Profiler, {
  id: 'App_Profiler',
  onRender: onRenderCallback, 
}, App(store));

function onRenderCallback (
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  const profiles = {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  } 

  //console.log('profiles: %o', profiles);
  
}

export default 'development' === process.env.NODE_ENV ? Profiler : App;
