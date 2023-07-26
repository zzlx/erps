/**
 * *****************************************************************************
 *
 * 前端未匹配页面
 *
 * *****************************************************************************
 */

import React from "../components/React.mjs";

export default class NoMatch extends React.Component {
  render (props) {
    return React.createElement('div', {
      className: "test",
    }, '404: Not Found Error');
  }
}
