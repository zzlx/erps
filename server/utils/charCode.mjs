/**
 * *****************************************************************************
 *
 * char code -- 字符编码
 * =====================
 * 
 *
 *
 * *****************************************************************************
 */

export default new Proxy({
  toUnicode: function (str) {
    let retval = '';

    for (let i; i < str.length; i++) {
      retval += `\\u${str.charCodeAt(i).toString(16)}`
    }

    return retval;
  },

  unicodeToString: function (unicodeStr) {
    let retval = '';
    const unicodeArray = unicodeStr.split('\\u');
    
    for (let i = 0; i < unicodeArray.length; i++ ) {
      retval += String.fromCharCode(parseInt(unicodeArray[i], 16));
    }

    return retval;
  }

}, {
	get: function (target, property, receiver) {
    if (!(property in target)) {
      const msg = `${property} is not supported.`;
      if (console && console.warn) console.warn(msg);
      else console.log(msg);
    }

		return Reflect.get(target, property, receiver);
  }
});
