/**
 * *****************************************************************************
 *
 * Element 
 *
 * 操作React Element对象
 * 提供添加、删除 、toggle className功能
 *
 * @file Element.mjs
 * *****************************************************************************
 */

import React from 'react';

export default class Element {
  constructor (element) {
    this._element = element;
    this._classList = new ClassList(element);
  }

  get classList () {
    return this;
  }

  get element () {
    
  }

  // 添加className
  addClassName (className) {
    const element  = this.element;

    const cn = [
      element.props.className,
      ...className,
    ].filter(Boolean).join(' ');

    this.element = React.cloneElement(element, { className: cn});

    return this;
  }
}

class ClassList {
  constructor (element) {
    this._element = element;
    const className = element.props.className;
    this._classNames = className && 'string' === typeof className
      ? new Set(className.split(/\s+/))
      : new Set();
  }

  add () {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
      }
    }

    if (arguments.length === 1 && 'string' === typeof arguments[0]) {
      String(arguments[0]).split(/s+/).forEach(v => {
        this._classNames.add(v);
      });
    }

    return this;
  }

  remove () {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.remove(arguments[i]);
      }
    }

    if (arguments.length === 1 && 'string' === typeof arguments[0]) {
      String(arguments[0]).split(/s+/).forEach(v => {
        this._classNames.delete(v);
      });
    }

    return this;
  }

  toggle () {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.remove(arguments[i]);
      }
    }

    if (arguments.length === 1 && 'string' === typeof arguments[0]) {
      String(arguments[0]).split(/s+/).forEach(v => {
        if (this._classNames.has(v)) this._classNames.add(v);
        else this._classNames.delete(v);
      });
    }

    return this;
  }
}
