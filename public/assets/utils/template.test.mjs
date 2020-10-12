/**
 * *****************************************************************************
 *
 * 字符串模板替换
 *
 * *****************************************************************************
 */

const template = (str, obj) => new Proxy({
  rawStr: str,
  
});

/**
 * 解析器
 */

export function parse () {
  const str = this.rawStr;
  const obj = this.obj;

  let retval = '';
  let flag = false;
  let start;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      flag = true;
      start = i + 1;
      continue;
    }
    if (!flag) retval += str[i];
    else {
      if (str[i] === '}') {
        flag = false;
        retval += match(str.slice(start, i), obj);
      }
    }
  }

  return retval;
}

/**
 * 从对象中取值
 */

export function match (str, obj) { 
  let o = obj;
  const keys = str.split('.').slice(1);
  for (let key of keys) o = o[key] || `{${str}}`;
  return o;
}

//console.log(match('a.b', {b: 'test'}));
//console.log(templateStr('{a.b}', {b: 'test'}));
//
export default template;
