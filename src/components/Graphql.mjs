/**
 *
 *
 */

export default function Graphql () {

  // 如果没有提供opts.url,则使用同域名下3000端口 
  const url = opts.url 
    ? new URL(opts.url)
    : new URL(window.location.href);

  // 统一配置api端口
  url.port = 3000;
  url.pathname = '/api/graphql';

  const graphql = (opts) => fetch(url.href, {
    method: opts.method || 'POST',
    mode: opts.mode || 'cors',
    //cache: 'default',
    credentials: opts.credentials || 'omit', // include/same-origin/omit 
    headers: {
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
    console.log(response);
  });

}
