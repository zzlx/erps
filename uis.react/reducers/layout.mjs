/**
 * *****************************************************************************
 *
 * *****************************************************************************
 */

const layouts = [
  { header: {} },
  { body: {} },
  { footer: {} },
];

export const layout = (state = layouts, action) => {
  switch (action.type) {
    case 'TOGGLE_TODO':
    default:
      return state;
  }
}
