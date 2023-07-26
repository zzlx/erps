/**
 * *****************************************************************************
 *
 * env配置管理器
 *
 * *****************************************************************************
 */

import assert from "assert";
import fs from "fs";
import path from "path";
import { paths } from "./paths.mjs";

const DOT_ENV = path.join(paths.ROOT, ".env");

const dotenvObj = fs.existsSync(DOT_ENV)
  ?  envParser(fs.readFileSync(DOT_ENV))
  : {};

assert(typeof dotenvObj === "object", "解析.env文件出错");

for (let env of Object.keys(dotenvObj)) {
  if (process.env[env] == null) process.env[env] = dotenvObj[env];
}

export const env = new Proxy(dotenvObj, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, receiver) {
  }
});

/**
 *
 * 环境配置解析器
 *
 * 解析获取到的命令行参数列表，返回参数对象
 *
 * @params {string} env
 * @return {object} state
 */

function envParser (source = "") {
  const obj = Object.create(null);

  source.toString().split("\n").forEach(line => {
    const keyValuePair = line.match(/^s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (null !== keyValuePair) {
      const key = keyValuePair[1]; 
      let value = keyValuePair[2] || "";
      const len = value ? value.length : 0;
      if (value > 0 && value.charAt(0) === '"' && value.charAt(len -1) === '"') {
        value = value.replace(/\\n/gm, "");
      }
    
      value = value.replace(/(^['"]|['"]$)/g, "").trim();
      obj[key] = value;
    }
  });

  return obj;
}
