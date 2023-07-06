/**
 * *****************************************************************************
 *
 * Button
 * 按钮组件
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Button (props) {
  const { 
    link, theme, outline, lg, sm, block, // 样式配置
    onClick, onKeyDown, onMouseOver, 
    type, role, value, className, children, ...rests // 元素属性
  } = props;

  const cn = [
    'btn',
    theme && `btn-${theme}`,
    'd-print-none',
    outline && 'btn-outline',
    lg ^ sm && lg && 'btn-lg',
    sm ^ lg && sm && 'btn-sm',
    link && 'btn-link',
    block && 'btn-block',
    props.disabled && 'disabled',
    className,
  ].filter(Boolean).join(' ');


  // 设置button类型
  const button = type && /submit|reset/.test(type) 
    ? 'input' 
    : props.href ? 'a' : 'button';

  return React.createElement(button, {
    onClick: onClick ? onClick : actionHandler,
    onKeyDown: onKeyDown ? onKeyDown : actionHandler,

    className: cn,
    type: type ? type : button === 'a' ? null : 'button',
    role: role ? role : button === 'a' ? 'button' : null,
    value: button === 'input' ? value ? value : children : null,
    children: button === 'input' ? null : children, 
    ...rests,
  });
}

/**
 * 下拉框控制
 *
 */

function dropdown(e) {
  if (e.currentTarget.tagName === 'A') { 
    e.preventDefault(); // 禁用默认行为
  }

  const button = e.currentTarget;
  const parent = e.currentTarget.parentNode;
  const menu = parent.querySelector('.dropdown-menu');

  if (window.getComputedStyle(menu, null)['position'] === 'absolute') {

    let position = 'bottom';
    if (parent.classList.contains('dropdown')) position = 'bottom'; 
    if (parent.classList.contains('dropup')) position = 'top'; 
    if (parent.classList.contains('dropleft')) position = 'left'; 
    if (parent.classList.contains('dropright')) position = 'right'; 

    const b = e.currentTarget.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    const d = document.body.getBoundingClientRect();

    // 超出右边界
    if (b.x + b.width - d.width > 0) {
      menu.setAttribute("style",`top: ${b.y + b.height}px; left: -${d.width - b.x - b.width}px;`);
    }

    // 超出下边界

  } 

  if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Escape')) {
    menu.classList.remove('show'); 
  }

  if (e.type === 'click') {
    if (!menu.classList.contains('show')) {
      e.currentTarget.focus();
      const removeShow = e => menu.classList.remove('show');

      // 注册blur事件
      button.addEventListener('blur', removeShow);

      // 注册mouseenter事件
      menu.addEventListener('mouseenter', e => {
        if (e.target === menu) button.removeEventListener('blur', removeShow);
      });

      // 注册mouseout事件
      menu.addEventListener('mouseleave', e => {
        if (e.target === menu) button.addEventListener('blur', removeShow);
      });
    }
    //menu.classList.add('collapsing');
    menu.classList.toggle('show');
  }
}

/**
 * collapse
 */

function collapse(e) {
  e.preventDefault();
  const target = e.currentTarget.dataset['target'];
  const collapse = document.querySelectorAll(target);

  for (let item of collapse) {
    if (e.key === 'Escape') { item.classList.remove('show'); continue; }
    if (e.type === 'keydown' && e.key === 'Enter' || e.type === 'click') {
      item.classList.toggle('show');
      e.currentTarget.focus();
      const toggle = e.currentTarget;
      const rm = () => item.classList.remove('show');
      
      // 鼠标进入时注销blur事件
      e.currentTarget.parentNode.addEventListener('mouseenter', () => {
        toggle.removeEventListener('blur', rm, {once: true});
      });

      // 鼠标移出时绑定blur事件
      e.currentTarget.parentNode.addEventListener('mouseleave', () => {
        toggle.addEventListener('blur', rm, {once: true});
      });
    }
  }
}

/**
 *
 */
function handleFile (e) {
  const file = e.target.files[0]; 
  const fileReader = new FileReader();

  fileReader.addEventListener('load', e => { 
    const content = e.target.result;
    window.sessionStorage.setItem(file.name, content)
    //const data = csvToJSON(content);
    // 处理data数据
  });

  fileReader.readAsText(file);
}

function modalHandler(e) {
  const b = e.currentTarget;

  if (b.dataset['dismiss'] && b.dataset['dismiss'] === 'modal') {
    const modal = b.parentNode.parentNode.parentNode.parentNode; 
    modal.classList.remove('show', 'd-block');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) document.body.removeChild(backdrop);
    document.body.classList.remove('modal-open');
  }

  if (b.dataset['toggle'] && b.dataset['toggle'] === 'modal') {
    const target = b.dataset['target'];
    if (target == null) return;
    const modal = document.querySelector(target);
    if (modal.classList.contains('show')) {
      document.body.classList.remove('modal-open');

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) document.body.removeChild(backdrop);
      document.body.classList.remove('modal-open');
    } else {
      const backdrop = document.createElement('div');
      backdrop.classList.add('modal-backdrop', 'show');
      document.body.appendChild(backdrop);
      document.body.classList.add('modal-open');
    }

    modal.classList.toggle('show');
    modal.classList.toggle('d-block');
  }
}

function actionHandler(e) {
  const bt = e.currentTarget;

  if (bt.dataset['dismiss']) {
    switch (bt.dataset['dismiss']) {
      case 'modal': 
        return modalHandler(e); 
      default: break;
    }
  }

  if (bt.dataset['toggle']) {
    switch (bt.dataset['toggle']) {
      case 'modal': 
        return modalHandler(e); 
      case 'collapse': 
        return collapse(e);
      case 'dropdown': 
        return dropdown(e);
      default: 
        break;
    }
  }

  if (bt.dataset['print']) {
    return window.print();
  }

  if (bt.dataset['readFile']) {
    const target = bt.dataset['target'];
  }
}
