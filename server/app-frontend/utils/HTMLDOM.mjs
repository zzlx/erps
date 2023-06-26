/**
 * *****************************************************************************
 *
 * HTML Document Object Model
 * 
 *
 *
 * *****************************************************************************
 */

import { assert } from './assert.mjs';

const tmpl = Symbol('html.template');
const HT   = Symbol('html.title');
const KW   = Symbol('html.keywords');
const titleRegExp = /<title>([\S\s]*?)<\/title>/gi; 
const keywordsRegExp = /<meta name="keywords" content="([\S\s]*?)"\/>/gi; 
const descRegExp = /<meta name="description" content="([\S\s]*?)"\/>/gi; 
const bodyRegExp = /<div id="root">([\S\s]*?)<\/div>/gi; 

export class HTMLDOM {
  constructor(template = '') {
    this.type = 'html';
    this[tmpl] = template;
  }

  get title () {
    if (this[HT]) return this[HT];
    const t = titleRegExp.exec(this[tmpl]);
    return t ? t[1] : 'Untitled';
  }

  set title (value) {
    this[HT] = value;
    this[tmpl] = this[tmpl].replace(titleRegExp, `<title>${value}</title>`);
  }

  set description (value) {
    this[tmpl] = this[tmpl].replace(descRegExp, 
      `<meta name="description" content="${value}"/>`);
  }

  set keywords (value) {
    const keys = Array.isArray(value) ? value.join(',') : value;
    this[KW] = keys;
    this[tmpl] = this[tmpl].replace(keywordsRegExp, 
      `<meta name="keywords" content="${keys}"/>`);
  }

  get keywords () {
    if (this[KW]) return this[KW];
    const t = keywordsRegExp.exec(this[tmpl]);
    return t ? t[1].split(',') : [];
  }

  set body (value) {
    this[tmpl] = this[tmpl].replace(bodyRegExp, 
      `<div id="root">${value}</div>`);
  }

  toString () {
    return this[tmpl];
  }

  development () {
    this[tmpl] = this[tmpl].replace(/production\.min/gi, 'development');
    this[tmpl] = this[tmpl].replace(/index\.mjs/gi, 'index.mjs?env=development');
  }
}

HTMLDOM.prototype.getElementByID = function (id) {
  const idRegExp = new RegExp(`<div id="${id}"></div>`);
  if (this[tmpl].match(idRegExp)) {}
}
