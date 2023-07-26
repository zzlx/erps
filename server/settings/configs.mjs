/**
 * *****************************************************************************
 *
 * 配置项容器
 *
 * *****************************************************************************
 */

import fs from "fs";
import os from "os";
import path from "path";
import { appinfo } from "./appinfo.mjs";
import { paths } from "./paths.mjs";

paths.CONFIG = path.join(os.homedir(), ".config", appinfo.name);
const configFile = path.join(paths.CONFIG, "config.json");
// 写入配置文件

const defaultConfigs = {
  port: 8443,
  description: "系统配置",
  keys: null,
  passphrase: Math.random().toString(16).substr(2,8),
  cert: path.join(paths.CONFIG, "ssl", "localhost-cert.pem"),
  privateKey: path.join(paths.CONFIG, "ssl", "localhost-key.pem"),
};

if (fs.existsSync(configFile)) {
  const json = JSON.parse(fs.readFileSync(configFile, "utf8"));
  Object.assign(defaultConfigs, json);
} else {
  fs.writeFileSync(configFile, JSON.stringify(defaults));
}

export const configs = new Proxy(defaultConfigs, {
  get: function (target, property, receiver) {
    if (property === "IPv6") return isSupportIPv6();
    if (property === "key") return fs.readFileSync(target.key);
    if (property === "ca") return fs.readFileSync(target.ca);
    if (property === "chain") return fs.readFileSync(target.chain);

    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
    target[property] = value; // 重置配置
    // 将更新写入配置文件
    fs.promises.writeFile(configFile, JSON.stringify(target, null, 2));
    return true;
  }
});

/**
 * 判断系统是否支持IPv6
 */

function isSupportIPv6 () {
  let hasIPv6 = false;

  for (const networkInterface of Object.values(os.networkInterfaces())) {
    for (const network of networkInterface) {
      if (network.family === 6) { hasIPv6 = true; break; }
    }

    if (hasIPv6) break;
  }

  return hasIPv6;
}

/**
 * 检测是否配置systemd service
 */

async function isSupportSystemd (service) {
  const fs = await import("fs"); 
  const test = [
    "/usr/lib/systemd/system",
    "/etc/systemd/system/multi-user.target.wants",
  ].map(loc => fs.existsSync(path.join(loc, service)));
}
