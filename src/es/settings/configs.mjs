/**
 * *****************************************************************************
 *
 * 配置管理器
 *
 *
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

const defaultConfigs = {
  port: 8888, // 端口可以web后台进行修改
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
  fs.writeFileSync(configFile, JSON.stringify(defaultConfigs));
}

export const configs = new Proxy(defaultConfigs, {
  get: function (target, property, receiver) {
    if (property === "IPv6") return isSupportIPv6();
    if (property === "key") return fs.readFileSync(target.key);
    if (property === "ca") return target.ca ? fs.readFileSync(target.ca) : null;
    if (property === "chain") return fs.readFileSync(target.chain);
    if (property === "cert") return fs.readFileSync(target.cert);
    if (property === "privateKey") return fs.readFileSync(target.privateKey);
    if (property === "processTitle") {
      return new URL(appinfo.homepage).hostname.split(".").reverse().join(".");
    }

    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
    target[property] = value; // 重置配置
    // 将更新写入配置文件
    fs.promises.writeFile(configFile, JSON.stringify(target, null, 2));
    return true;
  },
});

/**
 * 判断系统是否支持IPv6
 */

function isSupportIPv6 () {
  let hasIPv6 = false;

  for (const networkInterface of Object.values(os.networkInterfaces())) {
    for (const network of networkInterface) {
      if (network.family === "IPv6") { hasIPv6 = true; break; }
    }

    if (hasIPv6) break;
  }

  return hasIPv6;
}

/**
 * 检测是否配置systemd service
 */

export async function isSupportSystemd (service) {
  const fs = await import("fs"); 
  [
    "/usr/lib/systemd/system",
    "/etc/systemd/system/multi-user.target.wants",
  ].map(loc => fs.existsSync(path.join(loc, service)));
}
