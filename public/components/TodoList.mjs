/**
 * *****************************************************************************
 *
 * 待办事项列表
 *
 * *****************************************************************************
 */

import Button from './Button.mjs';

export default class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: [], text: '' };

    // bind this
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render () {
    const input = React.createElement('input', {
      id: "new-todo", 
      onChange: this.handleChange,
      value: this.state.text,
    });

    const lists = this.state.items.map(
      item => React.createElement('li', { key: item.id, }, item.text)
    );
    const todolist = React.createElement('ul', null, lists);

    const button = React.createElement(Button, {
      theme: 'primary',
      sm: true,
      onClick: this.handleSubmit,
      block: true,
    }, `Add #${this.state.items.length + 1}`);

    const title = this.props.title 
      ? React.createElement('h5', null, this.props.title)
      : '待办事项';

    const form = React.createElement('form', {
      onSubmit: this.handleSubmit,
    }, input, button);

    return React.createElement(React.Fragment, null, 
      todolist,
      title, 
      form,
    );
  }

  handleChange(e) {
    this.setState({ text: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.state.text.length === 0) {
      return;
    }

    const newItem = {
      text: this.state.text,
      id: Date.now()
    };

    this.setState(state => ({
      items: state.items.concat(newItem),
      text: ''
    }));
  }
}
