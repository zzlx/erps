import React from 'react';
import {
  Alert,
  Tables,
} from '../components/index.mjs';
import graphql from '../actions/graphql.mjs';

/**
 *
 *
 */

export default class Databases extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dbs: null,
      errors: null,
    }
  }
}

Databases.prototype.render = function () {
  const title = {
    name: '名称',
    sizeOnDisk: '大小',
    empty: '空',
  }

  const dbs = Tables.DataTable({ 
    data: this.state.dbs, 
    hover: true,
    bordered: true,
    caption: '数据库列表',
  });

  const messages = null === this.state.errors
    ? null
    : Alert({data: this.state.errors});  

  return React.createElement(React.Fragment, null, 
    dbs,
  );
}

Databases.prototype.componentDidMount = function () {
  const query = `{
    dbs {
      name
      sizeOnDisk
      empty
    }
  }`;

  graphql({query}).then(res => {
    if (res.errors) {
      this.setState({errors: res.errors});
      return;
    }

    this.setState({dbs: res.data.dbs});

  });
}
