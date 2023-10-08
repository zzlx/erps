/**
 * *****************************************************************************
 *
 * The main program for backend-server.
 *
 * Usage: [options]
 *
 * Options:
 * -h, --help                  显示帮助信息
 * -v, --version               显示版本信息
 * --start                     启动服务
 * --stop                      关闭服务
 * --restart                   重启服务
 * --watch                     开发模式下观察源码变动情况
 *
 * *****************************************************************************
 */

import cp from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { argvParser, debounceAlgorithm } from "./utils/index.mjs";
import { paths } from "./settings/index.mjs";
import { appinfo } from "./settings/index.mjs";
import { scssRender } from "./utils/scssRender.mjs";
import { sendCommand } from "./sendCommand.mjs";
import { CLEAR_PAGE } from "./constants.mjs";

const debug = util.debuglog("debug:main");
const proc = { httpd: null };

export default function main (argvs) {
  const paramMap = argvParser(argvs);

  // 配置环境变量
  for (const param of paramMap.keys()) {
    switch (param) {
      case "devel":
      case "development":
        process.env.NODE_ENV = "development";
        paramMap.delete(param); 
        break;
      case "prod":
      case "production":
        process.env.NODE_ENV = "production";
        paramMap.delete(param); 
        break;
    }
  }

  // 执行任务
  let isExec = false; // 是否已执行

  for (const param of paramMap.keys()) {
    switch (param) {
      case "h":
      case "help":
        isExec = true;
        showHelp();
        paramMap.delete(param);
        break;
      case "v":
      case "version":
        isExec = true;
        showVersion();
        paramMap.delete(param);
        break;
      case "start":
        isExec = true;
        startHttpd();
        scssRender(); // 监测无css文件时再生成文件
        if (process.env.NODE_ENV === "development") { watchPath(); }
        paramMap.delete(param);
        break;
      case "renderCSS":
        isExec = true;
        scssRender(); // 渲染生成CSS文件
        paramMap.delete(param);
        break;
      case "copyJS":
        isExec = true;
        import("./utils/copyJS.mjs").then(m => m.copyJS).then(fn => fn([
          path.join(paths.NODE_MODULES, "react", "umd", "react.development.js"),
          path.join(paths.NODE_MODULES, "react", "umd", "react.production.min.js"),
          path.join(paths.NODE_MODULES, "react-dom", "umd", "react-dom.development.js"),
          path.join(paths.NODE_MODULES, "react-dom", "umd", "react-dom.production.min.js"),
        ]));
        paramMap.delete(param);
        break;
      case "stop":
        isExec = true;
        stopHttpd();
        paramMap.delete(param);
        break;
      case "restart":
        isExec = true;
        restartHttpd();
        paramMap.delete(param);
        break;
    } // end of switch
  } // end of for loop

  if (isExec === false) {
    paramMap.forEach(p => {
      console.warn("param %s is not supported.", p);
    });
  }
}

/**
 * 监控目录变动
 *
 * @todos:
 * 将监控目录的代码单独存放
 * 独立进程监控代码库改动，重启服务时使用热加载并保持原进程ID
 */

async function watchPath () {
  const { PathWatcher } = await import("./utils/PathWatcher.mjs");

  const restartHttps = debounceAlgorithm(() => {
    // debug("Restart service.");
    // sendCommand("RESTART");
    restartHttpd();
    // startHttpd(); // 由httpd进程自主控制重启
  }, 1500); // 每1500ms内仅重启1次

  const watcher = new PathWatcher([
    paths.APIS,
    paths.APPS,
    paths.SRC,
  ]);

  watcher.on("change", (f) => {
    debug(`File change:${f}`);
    if (/\.mjs/.test(f)) {
      // @todo: 不重启服务热更新前端代码
      /*
      if (/src\/uis/.test(f)) {
        return;
      }
      */
      eslint(f);
      restartHttps();
    } else if (/\.mts$/.test(f)) {
      tsc();
    } else if (/\.scss/.test(f)) {
      scssRender();
    }
  });
}

/**
 * 执行tsc
 */

function tsc () {
  cp.exec("tsc", (err, stdout, stderr) => {
    if (err) debug("err:", err);
    if (stdout) debug("stdout:", stdout);
    if (stderr) debug("stderr:", stderr);
  });
}

/**
 * Eslint 
 */

function eslint (file) {
  cp.exec(`npx eslint ${file}`, (error, stdout, stderr) => {
    if (stdout) { 
      console.log(CLEAR_PAGE); // eslint-disable-line
      console.log(stdout); // eslint-disable-line
    } else if (stderr) {
      console.log(CLEAR_PAGE); // eslint-disable-line
      console.log(stderr); // eslint-disable-line
    } else if (error) {
      console.log(CLEAR_PAGE); // eslint-disable-line
      console.log(error); // eslint-disable-line
    } else {
      console.log(CLEAR_PAGE); // eslint-disable-line
    }
  });
}

/**
 * start http daemon
 */

function startHttpd () {
  const args = [
    path.join(paths.SRC, "es", "http2d.mjs"),
  ];

  const options = {
    // keep running when the main process is exit
    // 若设置为true，后台服务无法重启
    detached: false,
    stdio: [0, 1, 2, null],
  };

  proc.httpd = cp.spawn(process.argv[0], args, options);

  // debug("Main process is running");
}

function stopHttpd () {
  if (proc.httpd && proc.httpd.killed === false) {
    proc.httpd.kill("SIGTSTP");
  } else {
    debug("Send stop command to HTTPD");
    sendCommand("STOP");
  }
}

function restartHttpd () {
  if (proc.httpd && proc.httpd.killed === false) {
    proc.httpd.kill("SIGTERM");
  } else {
    sendCommand("RESTART");
  }

  startHttpd();
}

/**
 * 显示帮助信息
 */

async function showHelp () {
  const __file = String.prototype.substr.call(import.meta.url, 7);
  const content = await fs.promises.readFile(__file, { encoding: "utf8" });
  // const divideLine = new Array(process.stdout.columns).join("-");
  const lines = content.split("\n");

  for (const line of lines) {
    if (line === "/**") {
      // process.stdout.write(divideLine + "\n");
      continue;
    }
    if (line === " */") break;
    process.stdout.write(line.substr(3) + "\n");
  }

  // process.stdout.write(divideLine + "\n");
}

/**
 * Show version infomations
 */

function showVersion () {
  const version = `ERPs Version: ${appinfo.version}
Current Node.js Version: ${process.version}`;
  process.stdout.write(version);
}
