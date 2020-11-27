/**
 * *****************************************************************************
 *
 * Card
 *
 * A flexible and extensible content container.
 *
 * *****************************************************************************
 */

import React from './_React.mjs';

export default class Card extends React.PureComponent {
  constructor(props) {
    super(props);
    this.Ref = React.createRef();
  }
}

Card.prototype.render = function () {
  const { theme, border, className, overlay, ...rests } = this.props;

  const cn = ['card'];

  if (theme && !border) {
    cn.push(`bg-${theme}`);
    if (theme === 'light') cn.push('text-dark');
    else cn.push('text-light');
  }

  if (border && theme) {
    cn.push(`border-${theme}`);
    if (theme === 'light') cn.push('text-dark');
    else cn.push(`text-${theme}`);
  }

  if (className) cn.push(className);

  return React.createElement('div', {
    ref: this.Ref,
    className: cn.join(' '),
    ...rests, 
  });
}

Card.prototype.componentDidMount = function () {
  const card = this.Ref.current;

  // add class to adapt bootstrap/card component
  const firstChild = card.firstElementChild;
  if (!firstChild) return;

  if (/H[1-6]|HEADER/i.test(firstChild.tagName)) firstChild.classList.add('card-header');
  if (/IMG|PICTURE/i.test(firstChild.tagName)) firstChild.classList.add('card-img-top');

  const lastChild  = card.lastElementChild;
  // add .card-img-bottom to lastchild img
  if (lastChild.tagName === 'IMG') lastChild.classList.add('card-img-bottom');
  if (lastChild.tagName === 'FOOTER') lastChild.classList.add('card-footer', 'text-muted');

  for (let i = 0; i < card.children.length; i++) {
    const v = card.children[i];
    if (v.tagname === 'IMG') {
      const imgClass = this.props.overlay ? 'card-img' : 'card-img-top';
      firstChild.classList.add(imgClass);
    }
    if (v.tagName === 'DIV') {
      const bodyClass = this.props.overlay ? 'card-img-overlay' : 'card-body';
      v.classList.add(bodyClass);
    }
  } 

  // add class to .card-header
  card.querySelectorAll(".card-header .nav-tabs").forEach(v => {
    v.classList.add('card-header-tabs');
  });
  card.querySelectorAll(".card-header .nav-pills").forEach(v => {
    v.classList.add('card-header-pills'); 
  });

  // add class to .card-body
  card.querySelectorAll(".card-body h5, .card-img-overlay h5").forEach(v => {
    v.classList.add('card-title'); 
  });
  card.querySelectorAll(".card-body h6, .card-img-overlay h6").forEach(v => {
    v.classList.add('card-subtitle', 'text-muted', 'mb-2');
  });
  card.querySelectorAll(".card-body p, .card-img-overlay p").forEach(v => {
    v.classList.add('card-text');
  });
  card.querySelectorAll(".card-body a:not(.btn), .card-img-overlay a:not(.btn)").forEach(v => {
    v.classList.add('card-link'); 
  });

}

// Card group
export function CardGroup (props) {
  const {group, deck, columns, className, ...rests} = props;
  const cn = [];
  if (group || (!columns && !deck)) cn.push('card-group');
  if (columns) cn.push('card-columns');
  if (deck) cn.push('card-deck');
  return React.createElement('div', { ...rests, className: cn.join(' ')});
} 
