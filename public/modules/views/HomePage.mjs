/**
 * *****************************************************************************
 *
 * 主页面程序
 *
 *
 * *****************************************************************************
 */

// 
import Context from '../components/Context.mjs';
import Cover from '../components/Cover.mjs';
import Circular from '../components/Circular.mjs';
import Footer from '../components/Footer.mjs';
import Markdown from '../components/Markdown.mjs';
import Placeholder from '../components/Placeholder.mjs';

export default class HomePage extends React.PureComponent {
  constructor(props, context) {
    super(props);

    this.state = { };
    this.needQuery = false;

  }

  render () {
    const { store } = this.context;
    const header = React.createElement('header', {
      className: 'mb-auto'
    }, 'HomePage');

    const circular = React.createElement(Circular, {size: "45"});
    const footer_inner = React.createElement(Markdown, null, 'Copyritht All rights reserved.');
    const footer = React.createElement(Footer, {
      className: 'mt-auto bg-gradient-default text-white',
      fluid: true,
    }, footer_inner); 

    return React.createElement(Cover, { }, header, circular, footer); 
  }

  componentDidMount() {
    const store = this.context.store;
    const types = store.getTypes();

    store.dispatch({type: types.ZZZ});
  }
}

HomePage.contextType = Context;
