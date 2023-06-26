/**
 * *****************************************************************************
 *
 *
 * Accordion(手风琴)组件
 *
 * Usages:
 *
 * 为组件提供数据：[ 
 *   { header: 'header1', body: 'strings', show: true },
 *   ...
 * ]
 *
 *
 * @todo:增加支持数据生成模式
 * *****************************************************************************
 */

import React from './React.mjs';
import RawHtml from './RawHtml.mjs';
import { eventHandler } from '../actions/eventHandler.mjs';
//import { debuglog } from '../utils/debuglog.mjs';
//const debug = debuglog('debug:accordion');

const Header = props => React.createElement("h2", {
  className: "accordion-header",
}, React.createElement("button", {
  type: "button",
  className: `accordion-button${props.show ? "" : " collapsed"}`,
  onClick: eventHandler,
  children: props.children
})); // End of Header

const Body = props => React.createElement('div', {
  className: `accordion-collapse collapse${props.show ? " show" : ""}`
}, typeof props.children === 'string' ? React.createElement(RawHtml, {
  className: "accordion-body",
  children: props.children,
}) : React.isValidElement(props.children) ? React.createElement('div', {
  className: "accordion-body",
  children: props.children,
}) : null
); // End of Body

const Item = props => React.createElement("div", {
  className: "accordion-item",
  children: [
    React.createElement(Header, { 
      key: 0,
      show: props.show,
      children:  props.header
    }),
    React.createElement(Body, { 
      key: 1,
      show: props.show, 
      children: props.body 
    }),
  ],
});

export default function Accordion (props) {
  const { 
    alwaysOpen, 
    flush, 
    data,
    className, 
    ...rests 
  } = props;

  const cn = [
    "accordion",
    flush && "accordion-flush",
    className,
  ].filter(Boolean).join(' ');

  const dataChildren = Array.isArray(data) ? data.map((d, i) => {
    return React.createElement(Item, { 
      key: i, ...d 
    });
  }) : null;

  return React.createElement('div', { 
    className: cn, 
    'data-always': alwaysOpen ? true : false,
    children: dataChildren,
    ...rests 
  });
}
