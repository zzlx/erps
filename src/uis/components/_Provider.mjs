/**
 * *****************************************************************************
 *
 * Provider
 * 
 * 为子组件提供Context对象
 *
 * *****************************************************************************
 */

import React from './_React.mjs';
import Context from './_Context.mjs';
import { shallowEqual } from '../utils/assert.mjs';

export default class Provider extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      store: props.store,
      storeState: props.store.getState(),
    };

  }

  render () {
    return React.createElement(Context.Provider, {
      value: this.state
    }, this.props.children);
  }

  componentDidMount () {
    this._isMounted = true;
    this.subscribe();
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true; 
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.store !== prevProps.store) {
      if (this.unsubscribe) this.unsubscribe();
      this.subscribe();
    }
  }

  componentWillUnmount () {
    if (this.unsubscribe) this.unsubscribe();
    this._isMounted = false;
  }

  subscribe () {
    const store = this.props.store;

    this.unsubscribe = store.subscribe(() => {

      const newState = store.getState();

      // 防止unMount后，继续订阅store变化
      if (!this._isMounted) return;

      this.setState(prevState => {
        // If the value is the same, skip the unnecessary state update.
        if (shallowEqual(prevState.storeState, newState)) {
          return null;
        }

        return { storeState: newState };
      });
    });

    // handle actions that might have been dispatched between render and mount
    const postMountStoreState = store.getState();
    if (postMountStoreState !== this.state.storeState) {
      this.setState({ storeState: postMountStoreState });
    }
  }
}
