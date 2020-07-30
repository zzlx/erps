/**
 * *****************************************************************************
 * Provider
 * 
 * 为子组件提供context数据
 * *****************************************************************************
 */

import React from 'react';
import PropTypes from 'prop-types';
import Context from './Context.mjs';

export default class Provider extends React.Component {
  static propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }).isRequired,
    context: PropTypes.object,
    children: PropTypes.any
  };

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
    this.subscribe();
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
    const { store } = this.props;

    this.unsubscribe = store.subscribe(() => {
      const newState = store.getState();

      // 防止unMount后，继续订阅store变化
      if (!this._isMounted) return;

      this.setState(prevState => {
        // If the value is the same, skip the unnecessary state update.
        if (prevState.storeState === newState) return null;
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
