/**
 *
 *
 *
 *
 */

import { types } from './actions/index.mjs';
import isPlainObject from '../utils/isPlainObject.mjs';
import getIn from '../utils/getIn.mjs';

const $$observable = Symbol('observable');

class Store {
  constructor () {

    this.types = types;

    // 初始化state
    this.dispatch({ type: this.types.INIT});
  }


  getState () {
    if (this.isDispatching) {
      throw new Error('You may not call store.subscribe() while the reducer is executing.');
    }

    // read value from currentState
    return getIn.apply(currentState, arguments);
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    if (this.isDispatching) {
      throw new Error('You may not call store.subscribe() while the reducer is executing.');
    }

    this.isSubscribed = true;
  }


}
