/**
 * *****************************************************************************
 *
 * Provider
 * 
 * 为子组件提供context数据
 *
 * *****************************************************************************
 */

import assert from '../utils/assert.mjs';
import Context from './Context.mjs';
import React from './React.mjs';

console.log(React);
export default class Provider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      store: props.store,
      storeState: props.store.getState(),
    }
  }

  render() {
    return React.createElement(Context.Provider, {
      value: this.state,
      children: this.props.children,
    });
  }

  componentDidMount() {
    this._isMounted = true;
    this.subscribe(); // 订阅store更新
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true; // always update?
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // update后若重置store，则重新订阅store更新
    if (this.props.store !== prevProps.store) {
      if (this.unsubscribe) this.unsubscribe();
      this.subscribe();
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    this._isMounted = false;
  }

  subscribe() {
    const store = this.props.store;

    this.unsubscribe = store.subscribe(() => {

      const newState = store.getState();

      // 防止unMount后，继续订阅store变化
      if (!this._isMounted) return;

      this.setState(prevState => {
        // If the value is the same, skip the unnecessary state update.
        if (assert.shallowEqual(prevState.storeState, newState)) {
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
