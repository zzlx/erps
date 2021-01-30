/**
 *
 */

const layouts = [
  { header: {} },
  { body: {} },
  { footer: {} },
];

export default function layout(state = layouts, action) {
  switch (action.type) {
    case 'TOGGLE_TODO':
    default:
      return state;
  }
}
