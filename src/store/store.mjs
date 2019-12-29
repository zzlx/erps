import * as reducers from '../reducers/index.mjs';
import configureStore from './configureStore.mjs';

export default configureStore({ reducers: reducers });
