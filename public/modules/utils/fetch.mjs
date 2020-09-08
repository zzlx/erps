/**
 * *****************************************************************************
 *
 * Fetch
 *
 * 浏览器不支持fetch时提供备选方案
 *
 * *****************************************************************************
 */

export default globalThis.fetch || new Fetch();

class Fetch {
  constructor() {
    console.log('// @todo: 未完成');
  }

  getXhr() {
    const noXhrPatch =
      typeof window !== 'undefined' && !!window.ActiveXObject &&
        !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);
    // from backbone.js 1.1.2
    // https://github.com/jashkenas/backbone/blob/1.1.2/backbone.js#L1181
    if (noXhrPatch && !(/^(get|post|head|put|delete|options)$/i.test(this.method))) {
      this.usingActiveXhr = true;
      return new ActiveXObject("Microsoft.XMLHTTP");
    }
    return new XMLHttpRequest();
  }
}
