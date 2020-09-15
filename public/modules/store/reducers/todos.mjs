/**
 *
 */

import { types } from '../actions/index.mjs';
import getIn from '../../utils/getIn.mjs';

export default (state = {}, action) => {
  const newState = {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
  };

  return newState;
}

function todos(state = [], action) {
  if (action.error) return state;
  if (action.payload && action.payload.error) return state;

  switch (action.type) {
    case types.FETCH_DATA:
      let newState = getIn.apply(action.payload, ['data', 'todos']);
      return newState;
      break;
    case types.QUERY_TODO:
      const todoData = getIn.apply(action.payload, ['data', 'todos']);
      if (todoData) return todoData;
      return state;

    case types.ADD_TODO:
      if (action.error) return state;
      if (!Array.isArray(action.payload.data.addTodo)) return state;
      return state.concat(action.payload.data.addTodo);

    case types.REMOVE_TODO:
      if (action.error) return state;
      return state.filter(todo => todo._id !== action.payload.data.removeTodo.id);

    case types.TOGGLE_TODO:
      return state.map(todo =>
        (todo._id == action.payload.data.toggleTodo._id)
          ? Object.assign({}, todo, {completed: !todo.completed})
          : todo
      );

    default:
      return state;
  }
}

function visibilityFilter (state = 'SHOW_ALL', action) {
  return state;
}
