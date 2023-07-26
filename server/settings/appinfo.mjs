/**
 * *****************************************************************************
 *
 * package.json 配置管理器
 *
 * 用于读取或编辑package.json配置信息
 *
 * *****************************************************************************
 */

import fs from "node:fs";
import { paths } from "./paths.mjs";

const packageJSON = JSON.parse(await fs.promises.readFile(paths.PACKAGE));

export const appinfo = new Proxy(packageJSON, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
    if (target[property] === undefined) return false;

    // modify target property and write to package.json file
    target[property] = value;
    fs.promises.writeFile(paths.PACKAGE, JSON.stringify(target, null, 2));
    return true;
  }
});
