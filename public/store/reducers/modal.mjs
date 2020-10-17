/**
 *
 *
 *
 *
 *
 *
 *
 */

export default (state = { show: false }, action) => {
  if (action.type === 'MODAL_CLOSE') return { show: false };
  if (action.type === 'MODAL_OPEN') return { show: true };
  return state;
}
