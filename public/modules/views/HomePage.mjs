/**
 * *****************************************************************************
 *
 * 主页面程序
 *
 *
 * *****************************************************************************
 */

import Context from '../components/Context.mjs';
import Circular from '../components/Circular.mjs';
import Footer from '../components/Footer.mjs';
import Markdown from '../components/Markdown.mjs';
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
      className: 'mb-auto'
    }, 'HomePage');

    const circular = React.createElement(Circular, {size: "145"});
    const footer_inner = React.createElement(Markdown, null,'Copyritht All rights reserved.');
    const footer = React.createElement(Footer, {
      className: 'mt-auto bg-gradient-default text-white',
      fluid: true,
    }, footer_inner); 

    return React.createElement(React.Fragment, { }, 
      header, 
      circular, 
      circular, 
      footer
    ); 
  }

  componentDidMount() {
    console.log(this.props);
    const store = this.context.store;
    store.dispatch({type: store.types.ZZZ});
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldUpdate');
    // 组件更新逻辑
    return false;
  }
}

HomePage.contextType = Context;
