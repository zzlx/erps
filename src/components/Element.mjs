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
  }

  get classList () {
    if (this._classList == null) {
      this._classList = new ClassList(this._element);
    }

    return this._classList;
  }

  get element () {
    this._element = React.cloneElement(this._element, { 
      className: String(this.classList),
    });

    return this._element;
  }
}

/**
 *
 */

class ClassList {
  constructor (className) {
    this._classNames = className && 'string' === typeof className
      ? new Set(className.split(/\s+/))
      : new Set();
  }

  toString() {
    return [...this._classNames].join(' ');
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
