/**
 * 执行一次graphql查询
 *
 */

import { types } from './index.mjs';

export default (opts) => store => {
  const api_address = store.getState('profiles', 'api_address');

  if (api_address) opts.url = api_address;

  store.dispatch({ type: types.GRAPHQL_QUERY, payload: opts });

  return fetch(opts.url, {
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
      query: opts.query,
      variables: opts.variables,
      operationName: opts.operationName,
    }),
  }).then(response => {
    if (!response.ok) {
      throw new Error('status = ' + response.status);
    }

    const result = response.json();
    store.dispatch({ type: types.GRAPHQL_QUERY_RESULT, payload: result });
    return result;
  }).catch(err => { console.log(err); });
}
