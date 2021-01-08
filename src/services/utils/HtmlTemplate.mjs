/**
 * *****************************************************************************
 *
 * HTML Template
 *
 * *****************************************************************************
 */

import assert from 'assert';
import jsdom from 'jsdom';

export default class HTMLTemplate {
  constructor(props) {
    this.dom = new jsdom.JSDOM(props.template || '');
    this.document = this.dom.window.document;
  }

  setKeywords () {
    const keys = Array.prototype.slice.call(arguments);
    return this;
  }

  set title (value) {
    assert(typeof value === 'string', 'Title value must be string.');
    this.document.title = value;
    return this;
  }

  addMeta (value) {
    const metas = this.document.getElementsByTagName('meta');
    let meta = null;

    // search meta element 
    for (const m of metas) {
      if (m.name === value.name) {
        m.content = value.content;
        meta = m;
        break;
      }
    }

    // not found
    if (meta == null) {
      meta = this.document.createElement('meta');
      meta.name = value.name;
      meta.content = value.content;
      this.document.head.appendChild(meta);
    }

    return this;
  }

  addScript (scripts) {
    if (Array.isArray(scripts)) {
      for (const script of scripts) this.addScript(script);
    }

    assert(typeof scripts === 'object', 'Script must be type of object.') 

    const script = this.document.createElement('script'); 

    for (const k of Object.keys(scripts)) {
      script[k] = scripts[k] === true ? true : scripts[k];
    }
    this.document.head.appendChild(script);

    return this;
  }

  render () {
    return this.dom.serialize();
  }
}
