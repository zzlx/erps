/**
 * *****************************************************************************
 *
 * Layout Component
 *
 *
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Layout (props) {
  const { 
    className, 
    header,
    footer,
    children, 
    ...rests 
  } = props;

  /*
    'd-print-none',
    'bg-gradient-default',
    'text-white',
  */

  const cn = [
    'container',
    className,
  ].fileter(Boolean).join(' ');

  const head = React.createElement(Header, { className: cn }, header); 
  const foot = React.createElement(Footer, { className: cn }, footer); 
  return React.createElement(React.Fragment, { ...rests }, head, children, foot);
}

/**
 * Header Component
 */

export function Header (props) {
  const { className, ...rests } = props;

  const cn = [
    'header',
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('header', { className: cn, ...rests });
}

/**
 * Footer
 */

export function Footer (props) {
  const { fluid, className, ...rests } = props; 

  // 应用footer类名 
  const footerCN = ['footer', className].filter(Boolean).join(' ');

  const innerCN = [
    fluid ? 'container-fluid' : 'container',
    'font-weight-light',
    'p-2',
  ].filter(Boolean).join(' ');

  return React.createElement('footer', {
    className: footerCN,
  }, React.createElement('div', {
    className: innerCN,
    ...rests
  }));
}
