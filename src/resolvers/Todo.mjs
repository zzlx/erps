/**
 *
 *
 *
 */

const Todo = {
  _id: (obj) => obj._id.toString(),
  text: (obj) => obj.text,
  completed: (obj) => obj.completed,
} 

export default Todo;
