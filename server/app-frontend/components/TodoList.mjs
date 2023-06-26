/**
 * *****************************************************************************
 *
 * 待办事项列表
 *
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import Context from './Context.mjs';
import Button from './Button.mjs';
import { default as Message } from './Alert.mjs';

export default class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: [], text: '' };
  }

  render () {
    const input = React.createElement('input', {
      id: "new-todo", 
      onChange: this.handleChange.bind(this),
      onKeyDown: this.handleKeyDown.bind(this),
      value: this.state.text,
    });

    const lists = this.state.items.map(item => 
      React.createElement(Message, { key: item.id, }, item.text));
    const todolist = React.createElement('div', null, lists);

    const button = React.createElement(Button, {
      onClick: this.handleClick.bind(this),
    }, `Add #${this.state.items.length + 1}`);

    const title = this.props.title 
      ? React.createElement('h5', null, this.props.title)
      : '待办事项';
    const group = React.createElement('div', null, input, button);

    const form = React.createElement('form', {
      onSubmit: this.handleSubmit.bind(this, this.state.items),
    }, group);

    return React.createElement('div', {

    }, title, form, todolist);
  }

  handleChange(e) {
    this.setState({ text: e.target.value });
  }

  handleKeyDown (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleClick.call(this)
    }
  }

  handleSubmit(items, e) {
    //e.preventDefault();
    e.stopPropagation(); // 阻止冒泡
    console.log(e.currentTarget);
  }

  handleClick(e) {
    //e.preventDefault();
    //e.stopPropagation();

    if (this.state.text.length === 0) return;

    this.context.store.dispatch({
      type: 'WEBSOCKET_SEND',
      payload: this.state.text
    });
    const newItem = { text: this.state.text, id: Date.now() };
    
    this.setState(state => ({
      items: state.items.concat(newItem),
      text: ''
    }));
  }
}

TodoList.contextType = Context;
