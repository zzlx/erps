/**
 * *****************************************************************************
 *
 * 主页程序
 *
 * *****************************************************************************
 */

import React from '../components/React.mjs';
const T = React.lazy(() => import('./Games.mjs'));

export default function HomePage (props) {

  const loading = React.createElement('span', null, 'Loading...');

  return React.createElement(React.Suspense, {
    fallback: loading,
    children: React.createElement(T)
  });
}
