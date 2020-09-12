import combineReducers from './combineReducers.mjs';

import data from './reducers/data.mjs';
import files from './reducers/files.mjs';
import location from './reducers/location.mjs';
import messages from './reducers/messages.mjs';
import modal from './reducers/modal.mjs';
import navs from './reducers/navs.mjs';
import profiles from './reducers/profiles.mjs';
import routes from './reducers/routes.mjs';
import settings from './reducers/settings.mjs';
import todos from './reducers/todos.mjs';
import users from './reducers/users.mjs';

export default combineReducers({
  data,
  files,
  location,
  messages,
  modal,
  navs,
  profiles,
  routes,
  settings,
  todos,
  users,
});
