/**
 * *****************************************************************************
 *
 * PageNotFound页面
 *
 * 前端未匹配页面时显示
 *
 * *****************************************************************************
 */

import Context from "../components/Context.mjs";
import React from "../components/React.mjs";
import { debuglog } from "../utils/debuglog.mjs";

const debug = debuglog("debug:PageNotFound");

export default class NoMatch extends React.Component {
  render (props) {
    const message = React.createElement("h2", { 
      className: "text-center" 
    }, "Page Not Found.");

    const hr = React.createElement("hr");

    return React.createElement('div', {
      className: "test",
    }, message, hr);
  }

  componentDidMount () {
    // 
    debug(this.context.store.getState())

  }
}

NoMatch.contextType = Context;
