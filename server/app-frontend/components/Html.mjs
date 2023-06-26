/**
 * *****************************************************************************
 *
 * Html component
 *
 * 构造HTML页面框架,提供动态修改head的能力
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Html (props) {

  const isDevel = globalThis.env && globalThis.env === 'development' 
    ? true 
    : process && process.env && process.env.NODE_ENV === 'development' ? true : false;

  // 获取执行环境

  // 构建页面内容
  const head = React.createElement('head', null,
    React.createElement('meta', { charSet: "utf-8" }),
    React.createElement('meta', { name: "keywords", content: props.keywords }),
    React.createElement('meta', { name: "description", content: props.description }),
    React.createElement('meta', { name: "viewport", content: props.viewport }),
    React.createElement('title', null, props.title),

    React.createElement('link', { rel: "stylesheet", href: "/assets/css/styles.css" }),

    React.createElement('script', { 
      src: `/assets/es/csr.mjs${isDevel ? '?env=development' : ''}`, 
      type: "module" 
    }),

    React.createElement('script', { 
      src: isDevel 
        ? "/assets/js/react.development.js" 
        : "/assets/js/react.production.min.js" 
    }),

    React.createElement('script', { 
      src: isDevel 
        ? "/assets/js/react-dom.development.js" 
        : "/assets/js/react-dom.production.min.js" 
    }),

    React.createElement('script', { src: "/assets/es/noModule.js", noModule: true })
  );

  const noscript = React.createElement('noscript', {
    dangerouslySetInnerHTML: { 
      __html: `  <div class="alert alert-warning sticky-top" role="alert">
    <h4 class="alert-heading">提示信息⚠️:</h4>
    <hr/>
    <pre>
    当前客户端未启用JavaScript或不支持JavaScript.
    访问当前资源需要JavaScript支持.
    当前页面资源无法继续访问.
    请更换客户端或启用JavaScript支持后重试!
    </pre>
  </div>`
    }
  });

  const initialState = React.createElement('script', {
    children: '\nwindow.__INITIAL_STATE__ = ' + JSON.stringify(props.initialState),
  });

  const body = React.createElement('body', {},
    props.children, 
    noscript,
    initialState
  );

  const html = React.createElement('html', { 
    lang: "zh-cmn-Hans",
    ssr: "true",
  }, head, body);

  return html;
}
