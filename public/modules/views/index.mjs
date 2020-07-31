/**
 * *****************************************************************************
 *
 * User Interfaces application.
 *
 * @todo: 减少或避免使用硬编码组件内容
 *
 * *****************************************************************************
 */

import Provider from '../components/Provider.mjs';
import Route from '../components/Route.mjs';
//import Redirect from '../components/Redirect.mjs';
//import Switch from '../components/Switch.mjs';

import Alert from '../components/Alert.mjs';
import Button from '../components/Button.mjs';
import Container from '../components/Container.mjs';
import Footer from '../components/Footer.mjs';

import routes from '../routes/index.mjs'; 

// App
export default function (store) {
  const el = React.createElement;
  const alerts = el(Alert, {
    dismissible: true
  }, 'Hello!');
  const body = el(Container, null, alerts);
  const p1 = el('p', null, 'Footer');
  const footer = el(Footer, { }, p1); 
  const html = el(React.Fragment, null, body, footer);

  return React.createElement(Provider, { store: store }, html);

}
