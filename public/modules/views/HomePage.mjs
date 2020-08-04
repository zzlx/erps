/**
 * *****************************************************************************
 *
 * 首页面前端程序
 *
 * @file HomePage.mjs
 * *****************************************************************************
 */

import Context from '../components/Context.mjs';
import Container from '../components/Container.mjs';
import Placeholder from '../components/Placeholder.mjs';
import debug from '../utils/debug.mjs';

export default class HomePage extends React.PureComponent {
  constructor(props, context) {
    super(props);

    this.state = { };
    this.needQuery = false;

  }

  render () {
    const { store } = this.context;

    return React.createElement(Container, {
      fluid: true,
    }, 'Homepage');
  }

  componentDidMount() {
    const store = this.context.store;
    const types = store.getTypes();

    store.dispatch({type: types.ZZZ});
  }
}

HomePage.contextType = Context;
