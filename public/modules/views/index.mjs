/**
 * *****************************************************************************
 *
 * User Interfaces application.
 *
 * @todo: 减少或避免使用硬编码组件内容
 *
 * *****************************************************************************
 */

import Alert from '../components/Alert.mjs';
import Button from '../components/Button.mjs';
import Container from '../components/Container.mjs';
import Footer from '../components/Footer.mjs';

// App
const App = function () {

  const alerts = React.createElement(Alert, null, 'Hello!');
  const body = React.createElement(Container, null, alerts);
  const p1 = React.createElement('p', null, 'Footer');
  const footer = React.createElement(Footer, { }, p1); 

  return React.createElement(React.Fragment, null, body, footer);
}
  

export default App
