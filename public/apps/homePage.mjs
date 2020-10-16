/**
 * *****************************************************************************
 *
 * 主页
 *
 * *****************************************************************************
 */

import Context from '../components/Context.mjs';
import Circular from '../components/Circular.mjs';
import Nav from '../components/Nav.mjs';
import Footer from '../components/Footer.mjs';
import Placeholder from '../components/Placeholder.mjs';
import Picture from '../components/Picture.mjs';

export default class HomePage extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = { };
  }

  render () {
    const { store } = this.context;

    const header = React.createElement('header', {
      className: 'mb-auto container-fluid'
    }, '函证中心');

    const circular = React.createElement(Circular, {size: "145"});
    const footer = React.createElement(Footer, {
      className: 'container-fluid bg-gradient-default text-white',
      fluid: true,
    }, 'Copyrigth(2020) All rights reserved.'); 

    return React.createElement(React.Fragment, {}, 
      header, 
      footer
    ); 
  }

  componentDidMount() {
    const store = this.context.store;
    console.log(store.getState());
    store.dispatch({type: store.types.ZZZ});
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldUpdate');
    return false;
  }
}

HomePage.contextType = Context;
