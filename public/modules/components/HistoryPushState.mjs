/**
 *
 *
 *
 */

import types from '../store/actions/types.mjs';

export default function historyPushState (location) {
  // 刷新地址栏
  window.history.pushState(null, null, location.href);

  // 
  return ({
    type: types.HISTORY_PUSH_STATE, 
    payload: location
  });
}
