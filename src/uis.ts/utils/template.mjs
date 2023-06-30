/**
 * *****************************************************************************
 *
 * 模板字符串工具
 *
 * 一个类似模板字符串``的功能
 *
 * *****************************************************************************
 */

export const template = (str, obj) => new Proxy({
  rawStr: str,
  obj: obj,
}, {
  get: function (target, property, receiver) {
    if (property === 'toString') {
      return () => parse.call(target);
    }
    return Reflect.get(target, property, receiver);
  },
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
    if (str[i] === '$' && str[i+1] === "{") {
      flag = true;
      start = i + 2;
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
  for (let key of keys) {
    if (o[key] == null) {
      o = `{${str}}`;
      break;
    } else {
      o = o[key];
    }
  }
  return o;
}

//console.log(match('a.b', {b: 'test'}));
//console.log(parse.call({rawStr: '${a.b}', obj:{b: 'test'}}));
//console.log(String(template('${a.b}', {b:'test'})));
