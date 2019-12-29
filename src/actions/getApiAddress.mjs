/**
 *
 *
 */

import { types } from './index.mjs';

export default (path) => ({
  type: types.GET_API_ADDRESS,
  payload: window.fetch(window.location.origin + path, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip,deflate,br',
    },
  }).then(res => res.json()).catch(err => {
    console.log(err.message);
  }),
});
