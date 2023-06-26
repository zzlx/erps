/**
 * *****************************************************************************
 *
 * Regular Path Functions
 *
 * *****************************************************************************
 */

export const regularPath = {
  compile,
  parse,
  pathToRegexp,
};

/**
 * path to Regexp
 *
 * Normalize the given path string, and returning a regular expression.
 *
 * An empty array can be passed in for the keys, 
 * which will hold the placeholder key descriptions. 
 *
 * For example:
 * using `/user/:id`, `keys` will contain 
 * `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */

export function pathToRegexp (path, keys, options = {}) {
  if (!Array.isArray(keys)) {
    options = keys || options;
    keys = [];
  }

  // support RegExp/Array/String
  if (path instanceof RegExp) return regexpToRegexp(path, keys);
  if (Array.isArray(path)) return arrayToRegexp(path, keys, options); 
  if (typeof path === 'string') return stringToRegexp(path, keys, options); 

  throw new TypeError(`Unexpected path type: ${typeof(path)}`);
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */

function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  const groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (let i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys);
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */

function arrayToRegexp (path, keys, options) {
  const parts = [];

  for (let i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  const regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys);
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */

function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}


/**
 * Taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */

export function tokensToRegExp (tokens, keys, options) {
  if (!Array.isArray(keys)) {
    options = keys || options;
    keys = [];
  }

  options = options || {};

  let strict = options.strict;
  let end = options.end !== false;
  let route = '';

  // Iterate over the tokens and create our regexp string.
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      let prefix = escapeString(token.prefix);
      let capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = prefix + '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  const delimiter = escapeString(options.delimiter || '/');
  const endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + 
      '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys);
}

/**
 *
 * The main path matching regexp utility.
 *
 * Match Express-style parameters and un-named parameters with a prefix
 * and optional suffixes. Matches appear as:
 * "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
 * "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
 * "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
 *
 * @type {RegExp}
 */

export const PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',                        // [1]
  '|',
  '([\\/.])?',                      // [2]:匹配路径前导符号
  '(?:',
    '(?:',
      '\\:(\\w+)',                  // [3]:匹配到的项目
      '(?:',
        '\\(',
          '((?:\\\\.|[^\\\\()])+)', // [4]:匹配捕获
        '\\)',
      ')?',
      '|',
      '\\(',
        '((?:\\\\.|[^\\\\()])+)',   // [5]:匹配分组
      '\\)',
    ')', // 结束非捕获括号
    '([+*?])?',                     // [6]:匹配修饰符
    '|',
    '(\\*)',                        // [7]: 匹配星号
  ')',
].join(''), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */

export function parse (str, options) {

  const tokens = [];
  let key = 0
  let index = 0
  let path = ''
  let defaultDelimiter = options && options.delimiter ? options.delimiter : '/'
  let res;

  while ((res = PATH_REGEXP.exec(str)) != null) {

    const m = res[0];       // 匹配
    const escaped = res[1]; // 匹配
    const offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    // 忽略顺序
    if (escaped) { path += escaped[1]; continue; }

    const next = str[index];

    const prefix   = res[2]; // 匹配前缀
    const name     = res[3]; // 匹配name
    const capture  = res[4]; // 匹配捕获
    const group    = res[5]; // 匹配分组
    const modifier = res[6]; // 匹配修饰符
    const asterisk = res[7]; // 匹配* 0次或多次 

    // Push the current path onto the tokens.
    if (path) { 
      tokens.push(path); 
      path = ''; 
    }

    const partial = prefix != null && next != null && next !== prefix;
    const repeat = modifier === '+' || modifier === '*';   // 重复
    const optional = modifier === '?' || modifier === '*'; // 可选
    const delimiter = res[2] || defaultDelimiter; // 分隔符
    const pattern = capture || group; // 模式匹配

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern 
        ? escapeGroup(pattern) 
        : asterisk 
          ? '.*' 
          : '[^' + escapeString(delimiter) + ']+?'
    });
  }

  // Match any characters still remaining.
  if (index < str.length) path += str.substr(index);
  // If the path exists, push it onto the end.
  if (path) tokens.push(path);

  return tokens;
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */

export function compile (str, options) {
  return tokensToFunction(parse(str, options));
}

/**
 *
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */

function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, c => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * Encode the asterisk parameter. 
 * Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */

function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, c => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * Transforming tokens into the path function.
 *
 * @param {array} tokens
 * @return {function}
 */

export function tokensToFunction (tokens) {
  const matches = new Array(tokens.length); // Compile all the tokens into regexps.

  // Compile all the patterns before compilation.
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function pathFn (obj, opts) {

    let path = '';
    let data = obj || {};
    let options = opts || {};
    let encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i]

      if (typeof token === 'string') {
        path += token;
        continue;
      }

      let value = data[token.name];
      let segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) { path += token.prefix }
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (Array.isArray(value)) {
        if (!token.repeat) {
          throw new TypeError(
            'Expected "' + token.name + '" to not repeat, but received `' + 
            JSON.stringify(value) + '`'
          )
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (let j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError(
              'Expected all "' + token.name + '" to match "' + token.pattern + 
              '", but received `' + JSON.stringify(segment) + '`'
            );
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue;
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

      if (!matches[i].test(segment)) {
        throw new TypeError(
          'Expected "' + token.name + '" to match "' + token.pattern + 
          '", but received "' + segment + '"'
        );
      }

      path += token.prefix + segment;
    }

    return path;
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */

function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */

function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 *
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */

function flags (options) {
  return options.sensitive ? '' : 'i';
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */

function attachKeys (re, keys) {
  re.keys = keys;
  return re;
}
