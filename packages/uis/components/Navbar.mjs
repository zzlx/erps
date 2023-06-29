/**
 * *****************************************************************************
 *
 * Navbar component
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import ALink from './ALink.mjs';
import Nav from './Nav.mjs';
import Dropdown from './Dropdown.mjs';

export default function Navbar (props) {

  const [ show, setShow ] = React.useState(false);

  const { 
    dark,
    light,
    brand, menu, shortcuts,
    search,
    breakpoint,
    className, children,
    ...rests 
  } = Object.assign({}, { breakpoint: 'md'}, props);
  //const cRef = React.useRef(null);

  const toggler = React.createElement('button', {
    className: 'navbar-toggler collapsed',
    type: 'button',
    onClick: e => { 
      if (show == false) setShow(true);
      else setShow(false);
      //const c = cRef.current;
      //c.classList.toggle('show');
    }, 
  }, React.createElement('span', { className: 'navbar-toggler-icon' }));

  const searchBar = React.createElement('form', { className: 'd-flex' }, 
    React.createElement('input', { 
      className: 'form-control me-2', 
      type: 'search', 
      placeholder: '输入要查询的关键字' 
    }),
    React.createElement('button', { 
      className: 'btn btn-outline-success', 
      type: 'submit'
    }, 'Search' )
  );

  const collapse = React.createElement('div', { 
    className: `navbar-collapse collapse${show? ' show': ''}`,
    //ref: cRef,
  }, 
    Nav({ className: 'navbar-nav me-auto mb-2 mb-lg-0', data: menu.data}), 
    React.createElement('hr', { className: `d-${breakpoint}-none text-white` }),
    Nav({ className: 'navbar-nav', data: shortcuts.data}),
    children,
  );

  const isDark = dark && !light;
  const navbar = React.createElement('nav', {
    className: [
      'navbar', 
      `navbar-expand-${breakpoint}`, 
      //`navbar-${isDark ? 'dark' : 'light'}`, 
      //`bg-${isDark ? 'dark' : 'light'}`, 
      `px-3 px-${breakpoint}-5`,
      className
    ].filter(Boolean).join(' '),
    ...rests
  }, ALink(brand), toggler, collapse);

  return navbar;
}

function Nav (props) {
  const { data, ...rests } = props; 

  const item = (v, k) => React.createElement('li', {
    key: k,
    className: `nav-item${v.subMenu?' dropdown': ''}`,
  }, 
    ALink(Object.assign({}, { 
      className: `nav-link${v.subMenu ? ' dropdown-toggle' : ''}`,
      onClick: e => {
        const me = e.currentTarget;

        if (/dropdown/.test(me.className)) {
          if (/active/.test(me.className)) {
            me.classList.remove('active');
            me.blur();
          } else {
            me.focus(); // target获得焦点
            me.classList.add('active');
          }
        }
      },
      onFocus: e => {
        const me = e.currentTarget;
        if (/dropdown-toggle/.test(me.className)) {
          const dm = me.parentElement.getElementsByClassName('dropdown-menu');
          if (dm[0]) dm[0].classList.add('show');
        }
      },
      onBlur: e => {
        const me = e.currentTarget;
        if (/dropdown-toggle/.test(me.className)) {
          const dm = me.parentElement.getElementsByClassName('dropdown-menu');
          if (dm[0]) dm[0].classList.remove('show');
        }
      }
    }, v)), 
    v.subMenu ? SubNav(v.subMenu) : null
  );

  const items = data ? data.map((v, k) => item(v, k)) : null;

  return React.createElement('ul', {
    ...rests
  }, items);
}

function SubNav (props) {
  const { data, className, ...rests } = props;

  const item = (v, k) => v.divider
    ? React.createElement('hr', { className: 'dropdown-divider', key: k }) 
    : React.createElement('li', { key: k }, ALink(Object.assign({}, v, { 
        className: ['dropdown-item', v.className].filter(Boolean).join(' ') 
      }))
    );

  const items = data ? data.map((v,k) => item(v, k)) : null; 

  return React.createElement('ul', {
    className: ['dropdown-menu', className].filter(Boolean).join(' '),
    ...rests
  }, items);
}
