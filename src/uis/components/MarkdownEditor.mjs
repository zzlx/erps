/**
 * *****************************************************************************
 *
 * Markdown Editor
 *
 * *****************************************************************************
 */

import React from './_React.mjs';

export default class MarkdownEditor extends React.Component {
  constructor(props) {
    super(props);
    this.md = new Remarkable();
    this.handleChange = this.handleChange.bind(this);
    this.state = { value: 'Hello, **world**!' };
  }


}
