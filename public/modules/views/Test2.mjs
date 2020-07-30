/**
 * *****************************************************************************
 *
 * 测试页面
 *
 * @file Test.mjs
 * *****************************************************************************
 */

import Alert from '../components/Alert.mjs';
import Placeholder from '../components/Placeholder.mjs';
import Context from '../components/Context.mjs';
import Container from '../components/Container.mjs';

// export module
export default class TestPage extends React.Component {
  static contextType = Context;

  constructor(props, context) {
    super(props);
    this.state = { };
    this.needQuery = false;
  }

  render () {
    const { store } = this.context;

    return (
      <Container fluid breakpoint='lg'>
        <Alert theme='secondary' dismissible>
          <h4>header</h4>
          <hr />
          <p>test</p>
        </Alert>
        <Alert theme='success'> test </Alert>
        <Placeholder />
      </Container>
    );
  }

}
