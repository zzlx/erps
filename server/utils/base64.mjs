/**
 * *****************************************************************************
 *
 * Base64 -- 编码算法
 * =====================
 * 
 * 一种基于64个可打印字符来表示二进制数据的方法,
 * 用于传输8Bit字节码的编码算法.
 *
 * 编码算法:
 *
 * 1. 对数据进行分组,每三个字节作为一组，一共24bits;
 * 2. 对24bits划分为4组,每组6bits;
 * 3. 对每组的6bits前补2位0,构成8bits,有效位数为6位,可表示64个编码量
 * 4. 根据base64编码表,获取4组数据对应的编码值; 
 *
 * 解码算法:
 *
 * *****************************************************************************
 */

const _hasatob = typeof atob === 'function';
const _hasbtoa = typeof btoa === 'function';
const _hasBuffer = typeof Buffer === 'function';
const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64table = [...b64]; // base64编码表
const b64map  = (table => {
  const map = {};
  table.map((v,k) => map[v] = k);
  return map;
})(b64table); // base64映射

export default new Proxy({
  encode:  function (bin) { 
    const codes = []; 
    let un = bin.length % 3;
    if (un == 1) bin.push(0, 0);   // 补2位0
    else if (un == 2) bin.push(0); // 补1位0

    // 取出
    const takeout = (c, bits) => b64table[c >> bits & 0b111111] 

    for (let i = 2; i < bin.length; i += 3) {

      let c = bin[i - 2] << 16;
      c |= bin[i - 1] << 8;
      c |= bin[i];

      //const code = Uint32Array.from([0, bin[i -2], bin[i-1], bin[i]]);

      codes.push(takeout(c, 18));
      codes.push(takeout(c, 12));
      codes.push(takeout(c, 6));
      codes.push(takeout(c, 0));
    }

    if (un >= 1) {
      codes[codes.length - 1] = "=";
      bin.pop();
    }

    if (un == 1) {
      codes[codes.length - 2] = "=";
      bin.pop();
    }

    return codes.join("");
  },

  decode: function (base64Str) {
    let i = 0;
    let bin = [];
    let x = 0, code = 0, eq = 0;

    while (i < base64Str.length) {

      // 取出字符
      const c = base64Str.charAt(i++);

        var idx = this._table.indexOf(c);

        if (idx == -1) {
            switch (c) {
                case '=': idx = 0; eq++; break;
                case ' ':
                case '\n':
                case "\r":
                case '\t':
                    continue;
                default:
            }
        }

        if (eq > 0 && idx != 0)
        code = code << 6 | idx;

        if (++x != 4)
            continue;
        bin.push(code >> 16);
        bin.push(code >> 8 & 0xff);
        bin.push(code & 0xff)
        code = x = 0;
    }

    if (code != 0)
    if (eq == 1)
        bin.pop();
    else if (eq == 2) {
        bin.pop();
        bin.pop();
    } else if (eq > 2) {
    }

    return bin;
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

const version = '3.4.5';
const VERSION = version;
const b64tab = ((a) => {
    let tab = {};
    a.forEach((c, i) => tab[c] = i);
    return tab;
})(b64chs);

const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
const _fromCC = String.fromCharCode.bind(String);
const _U8Afrom = typeof Uint8Array.from === 'function'
    ? Uint8Array.from.bind(Uint8Array)
    : (it, fn = (x) => x) => new Uint8Array(Array.prototype.slice.call(it, 0).map(fn));
const _mkUriSafe = (src) => src
    .replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_')
    .replace(/=+$/m, '');
const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');

/**
 * polyfill version of `btoa`
 */
const btoaPolyfill = (bin) => {
    let u32, c0, c1, c2, asc = '';
    const pad = bin.length % 3;
    for (let i = 0; i < bin.length;) {
        if ((c0 = bin.charCodeAt(i++)) > 255 ||
            (c1 = bin.charCodeAt(i++)) > 255 ||
            (c2 = bin.charCodeAt(i++)) > 255)
            throw new TypeError('invalid character found');
        u32 = (c0 << 16) | (c1 << 8) | c2;
        asc += b64chs[u32 >> 18 & 63]
            + b64chs[u32 >> 12 & 63]
            + b64chs[u32 >> 6 & 63]
            + b64chs[u32 & 63];
    }
    return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};

/**
 * does what `window.btoa` of web browsers do.
 * @param {String} bin binary string
 * @returns {string} Base64-encoded string
 */
const _btoa = _hasbtoa ? (bin) => btoa(bin)
    : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')
        : btoaPolyfill;
const _fromUint8Array = _hasBuffer
    ? (u8a) => Buffer.from(u8a).toString('base64')
    : (u8a) => {
        // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
        const maxargs = 0x1000;
        let strs = [];
        for (let i = 0, l = u8a.length; i < l; i += maxargs) {
            strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
        }
        return _btoa(strs.join(''));
    };
/**
 * converts a Uint8Array to a Base64 string.
 * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
 * @returns {string} Base64 string
 */
const fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-8 string
 * @returns {string} UTF-16 string
 */
const utob = (src) => unescape(encodeURIComponent(src));
//
const _encode = _hasBuffer
    ? (s) => Buffer.from(s, 'utf8').toString('base64')
    : (s) => _btoa(utob(s));
/**
 * converts a UTF-8-encoded string to a Base64 string.
 * @param {boolean} [urlsafe] if `true` make the result URL-safe
 * @returns {string} Base64 string
 */
const encode = (src, urlsafe = false) => urlsafe
    ? _mkUriSafe(_encode(src))
    : _encode(src);
/**
 * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
 * @returns {string} Base64 string
 */
const encodeURI = (src) => encode(src, true);
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-16 string
 * @returns {string} UTF-8 string
 */
const btou = (src) => decodeURIComponent(escape(src));
/**
 * polyfill version of `atob`
 */
const atobPolyfill = (asc) => {
    // console.log('polyfilled');
    asc = asc.replace(/\s+/g, '');
    if (!b64re.test(asc))
        throw new TypeError('malformed base64.');
    asc += '=='.slice(2 - (asc.length & 3));
    let u24, bin = '', r1, r2;
    for (let i = 0; i < asc.length;) {
        u24 = b64tab[asc.charAt(i++)] << 18
            | b64tab[asc.charAt(i++)] << 12
            | (r1 = b64tab[asc.charAt(i++)]) << 6
            | (r2 = b64tab[asc.charAt(i++)]);
        bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)
            : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)
                : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
    }
    return bin;
};
/**
 * does what `window.atob` of web browsers do.
 * @param {String} asc Base64-encoded string
 * @returns {string} binary string
 */
const _atob = _hasatob ? (asc) => atob(_tidyB64(asc))
    : _hasBuffer ? (asc) => Buffer.from(asc, 'base64').toString('binary')
        : atobPolyfill;
const _decode = _hasBuffer
    ? (a) => Buffer.from(a, 'base64').toString('utf8')
    : (a) => btou(_atob(a));
const _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));
/**
 * converts a Base64 string to a UTF-8 string.
 * @param {String} src Base64 string.  Both normal and URL-safe are supported
 * @returns {string} UTF-8 string
 */
const decode = (src) => _decode(_unURI(src));
/**
 * converts a Base64 string to a Uint8Array.
 */
const toUint8Array = _hasBuffer
    ? (a) => _U8Afrom(Buffer.from(_unURI(a), 'base64'))
    : (a) => _U8Afrom(_atob(_unURI(a)), c => c.charCodeAt(0));
const _noEnum = (v) => {
    return {
        value: v, enumerable: false, writable: true, configurable: true
    };
};
/**
 * extend String.prototype with relevant methods
 */
const extendString = function () {
    const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
    _add('fromBase64', function () { return decode(this); });
    _add('toBase64', function (urlsafe) { return encode(this, urlsafe); });
    _add('toBase64URI', function () { return encode(this, true); });
    _add('toBase64URL', function () { return encode(this, true); });
    _add('toUint8Array', function () { return toUint8Array(this); });
};
/**
 * extend Uint8Array.prototype with relevant methods
 */
const extendUint8Array = function () {
    const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
    _add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });
    _add('toBase64URI', function () { return fromUint8Array(this, true); });
    _add('toBase64URL', function () { return fromUint8Array(this, true); });
};
/**
 * extend Builtin prototypes with relevant methods
 */
const extendBuiltins = () => {
    extendString();
    extendUint8Array();
};
const gBase64 = {
    version: version,
    VERSION: VERSION,
    atob: _atob,
    atobPolyfill: atobPolyfill,
    btoa: _btoa,
    btoaPolyfill: btoaPolyfill,
    fromBase64: decode,
    toBase64: encode,
    encode: encode,
    encodeURI: encodeURI,
    encodeURL: encodeURI,
    utob: utob,
    btou: btou,
    decode: decode,
    fromUint8Array: fromUint8Array,
    toUint8Array: toUint8Array,
    extendString: extendString,
    extendUint8Array: extendUint8Array,
    extendBuiltins: extendBuiltins,
};
// makecjs:CUT //
export { version };
export { VERSION };
export { _atob as atob };
export { atobPolyfill };
export { _btoa as btoa };
export { btoaPolyfill };
export { decode as fromBase64 };
export { encode as toBase64 };
export { utob };
export { encode };
export { encodeURI };
export { encodeURI as encodeURL };
export { btou };
export { decode };
export { fromUint8Array };
export { toUint8Array };
export { extendString };
export { extendUint8Array };
export { extendBuiltins };
// and finally,
export { gBase64 as Base64 };
