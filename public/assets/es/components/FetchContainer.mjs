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

export function FetchContainer () {
  const url = opts.url 
    ? new URL(opts.url)
    : new URL(window.location.href);
  
  url.protocol = 'https:'; // 强制使用https
  url.port = 8888; // 统一配置api端口
  if (url.pathname === '/') url.pathname = '/api/graphql';

  return (opts) => fetch(url.href, {
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
