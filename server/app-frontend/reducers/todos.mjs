/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

export function todos(state = [], action) {
  if (action.error) return state;
  if (action.payload && action.payload.error) return state;

  switch (action.type) {
    case 'FETCH_DATA':
      let newState = action.payload.data.todos;
      return newState;
      break;
    case 'QUERY_TODO':
      const todoData = action.payload.data.todos;
      if (todoData) return todoData;
      return state;

    case 'ADD_TODO':
      if (action.error) return state;
      if (!Array.isArray(action.payload.data.addTodo)) return state;
      return state.concat(action.payload.data.addTodo);

    case 'REMOVE_TODO':
      if (action.error) return state;
      return state.filter(todo => todo._id !== action.payload.data.removeTodo.id);

    case 'TOGGLE_TODO':
      return state.map(todo =>
        (todo._id == action.payload.data.toggleTodo._id)
          ? Object.assign({}, todo, {completed: !todo.completed})
          : todo
      );

    default:
      return state;
  }
}
