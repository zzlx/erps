import combineReducers from '../store/combineReducers.mjs';

import data from './data.mjs';
import files from './files.mjs';
import location from './location.mjs';
import messages from './messages.mjs';
import modal from './modal.mjs';
import navs from './navs.mjs';
import profiles from './profiles.mjs';
import routes from './routes.mjs';
import settings from './settings.mjs';
import todos from './todos.mjs';
import users from './users.mjs';

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
