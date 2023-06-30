/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import React from '../components/React.mjs';

export default class NoMatch extends React.Component {
  render (props) {
    return React.createElement('div', null, '404: NotFound');
  }
}
