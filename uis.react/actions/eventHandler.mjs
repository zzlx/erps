/**
 * *****************************************************************************
 *
 * 事件管理器
 * 管理前端UI组件的用户操作与响应
 *
 * click event handler
 *
 * *****************************************************************************
 */

import { debuglog } from '../utils/debuglog.mjs';
//import { store } from '../App.mjs';
const debug = debuglog('debug:event-handler');
const sp = e => e.stopPropagation(); // stop propagation
const pd = e => e.preventDefault();  // prevent defaults

export function eventHandler (e) {

  // event: click nav link
  if (e.target.classList.contains('nav-link')) {
    //e.target.classList.toggle('active');
    const nav = e.target.parentNode.parentNode;
    const links = nav.querySelectorAll('a.nav-link');

    // 遍历links,取消active状态
    for (const link of links) {
      if (link === event.target) link.classList.add('active');
      else link.classList.remove('active');
    }

    const selectors = e.target.hash;
    if (null == selectors || '' === selectors) return;
    const target = document.querySelector(selectors);
    if (null == target) return; // not found
    const tabContent = target.parentNode;
    for (const item of tabContent.children) { item.classList.remove('active'); }
    target.classList.add('active');

    return;
  }

  if (e.target.type === 'radio') { return radioHandler(e); }
  if (e.target.type === 'checkbox') { return checkboxHandler(e); }
  if (e.target.type === 'range') { return rangeHandler(e); }

  if (e.target.dataset) {
    if (e.target.dataset.bsDismiss === 'offcanvas') return dismissOffcanvas(e);
    if (e.target.dataset.bsToggle === 'offcanvas') return toggleOffcanvas(e);
  }

  if (e.type === 'click' && e.target.classList.contains("accordion-button")) {
    // record collapsed status
    const isCollapsed = e.target.classList.contains('collapsed'); 
    // location accordion
    const a = e.target.parentNode.parentNode.parentNode; 
    
    debug(`Accordion组件项目由${
      isCollapsed 
        ? '折叠' 
        : '展开'
    }变为${
      isCollapsed 
        ? '展开' 
        : '折叠'
    }`);
    
    if (a.dataset.always === 'false') {
      a.childNodes.forEach(item => {
        item.firstChild.firstChild.classList.add('collapsed');
        item.lastChild.classList.remove('show');
      });
    }

    // 根据情况切换显示状态
    if (isCollapsed) {
      e.target.classList.remove('collapsed');
      e.target.parentNode.nextSibling.classList.add("show");
    } else {
      e.target.classList.add('collapsed');
      e.target.parentNode.nextSibling.classList.remove("show");
    }

    return; // finish event handler
  } // End of accordion click event


}

export function dismissOffcanvas (e) {
  const offcanvas = e.target.parentNode.parentNode;
  offcanvas.classList.remove('show');
}

export function toggleOffcanvas (e) {
  const target = e.target.dataset.bsTarget;
  const offcanvas =  document.getElementById(target);
  offcanvas.classList.toggle('show');
}


/**
 *
 *
 *
 */

export function radioHandler (e) {
  const radios = t => t.querySelectorAll('input[type="radio"]');
  const isPNode = t => radios(t).length > 1;
  const pNode = isPNode(e.target.parentNode) 
    ? e.target.parentNode 
    : isPNode(e.target.parentNode.parentNode)
      ? e.target.parentNode.parentNode
      : null;

  // 单选逻辑,仅保留当前选项处于被选状态
  if (pNode) {
    radios(pNode).forEach(r => { r.checked = false; });
    e.target.checked = true;
  }
}

/**
 * 多选框控制
 *
 * 支持特性:
 *
 * * switch样式
 * * indeterminatae选项
 *
 */

export function checkboxHandler (e) {

  e.target.focus(); // get focus 

  debug(e);

  // Handle Keyboard event
  if (e.type === 'keydown') {

    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      e.target.checked = false;
    }

    if (e.key === 'Enter') {
      sp(e);
      pd(e);
      e.target.click();
    }

    if (e.key === 'Space') {
      e.target.click();
    }

    return;
  }

  if (e.type === 'keyup') { return }


  // condition:1
  // switcher 
  if (e.target.parentNode.classList.contains('form-switch')) {
    // 

  } else { // checkbox
    // condition:2
    // 从checked状态取消选取时 置interminate为true
    if (e.target.checked === false) {
      e.target.indeterminate = true; 
      e.target.classList.add("indeterminate");
    } // end of condition 2

    // condition:3
    if (e.target.checked === true && e.target.classList.contains("indeterminate")) {
      e.target.indeterminate = false; 
      e.target.classList.remove("indeterminate");
      e.target.checked = false;
    } // end of condition 3

  } // end of else
}


/**
 *
 *
 */

function rangeHandler (e) {
  e.target.focus();

  debug(e);

  if(e.target.nextSibling.classList.contains('form-label')) {
    const label = e.target.nextSibling;
    label.innerHTML = e.target.value;
  }

}
