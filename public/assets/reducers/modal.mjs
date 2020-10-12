/**
 *
 *
 *
 *
 *
 *
 *
 */

import { types } from '../actions/index.mjs';

export default (state = { show: false }, action) => {
  if (action.type === types.MODAL_CLOSE) return { show: false };
  if (action.type === types.MODAL_OPEN) return { show: true };
  return state;
}
