/**
 * *****************************************************************************
 *
 * 执行一次GraphQL查询
 *
 *
 *
 *
 * *****************************************************************************
 */

export default function Graphql () {
  // 如果没有提供opts.url,则使用同域名下3000端口 
  const url = opts.url 
    ? new URL(opts.url)
    : new URL(window.location.href);
  
  url.protocol = 'https:'; // 强制使用https
  url.port = 3000; // 统一配置api端口
  if (url.pathname === '/') url.pathname = '/api/graphql';

  const graphql = (opts) => fetch(url.href, {
    method: opts.method || 'POST',
    mode: opts.mode || 'cors',
    //cache: 'default',
    credentials: opts.credentials || 'omit', // include/same-origin/omit 
    headers: {
      'Authorization': 'Bearer <token>',
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip,deflate,br',
      'Content-Type': 'application/json',
    }, 
    body: JSON.stringify({ 
      query: opts.query || null,
      variables: opts.variables || null,
      operationName: opts.operationName || null,
    }),
  }).then(response => {
    if (response.ok) return response.json();

    // 错误响应信息
    if (console && console.warn) console.warn(response);
  });
}
