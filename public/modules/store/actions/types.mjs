/**
 * Action types
 *
 */

import types from './types.json';

const randomString = Math.random().toString(16).substring(7);
const randomTypes = {};

// add random string with types
for (let item of types) { 
  randomTypes[item.type] = item.type + '.' + randomString;
} 

export default randomTypes;
