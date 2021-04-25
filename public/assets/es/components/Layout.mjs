/**
 * *****************************************************************************
 *
 * Layout Component
 *
 *
 *
 * *****************************************************************************
 */

import { React } from './React.mjs';

export function Layout (props) {
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
 * Container component
 *
 * 提供一个容器组件
 *
 * @param {bool} props.fluid
 * @param {string} props.breakpoint
 * @return {obj} React element
 * @api public
 */

export function Container (props) {
  const breakpoints = ['sm', 'md', 'lg', 'xl'];
  const { breakpoint, fluid, className, ...rests } = props;

  const cn = [
    !fluid && 'container',
    fluid && 'container-fluid',
    breakpoints.include(breakpoint) && 'container-' + bp,
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: cn, ...rests });
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
