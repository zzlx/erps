/**
 * *****************************************************************************
 *
 * ERPD
 *
 * The backend-server daemon for ERP system.
 *
 * Usage: [options]
 *
 * Options:
 * -h, --help                  显示帮助信息
 * -v, --version               显示版本信息
 * --start                     启动服务
 * --stop                      关闭服务
 * --restart                   重启服务
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
const __file = String.prototype.substr.call(import.meta.url, 7);
const argvs = Array.prototype.slice.call(process.argv, 2);

debug(argvs);
const paramMap = argvParser(argvs);

process.title = "org.zzlx.erpd"; // Setting the main process title

// handle uncaught exception
// handle unhandled rejection 
// Print uptime in development env
process.on("exit", code => {
  debug("%d---程序结束前已经运行了%sms---", code, Math.ceil(process.uptime()*1000));
});



process.nextTick(() => { main(); });

// Set a process container
const proc = { 
  httpd: null,
};

/**
 * The main programe
 */

function main () {
  let isExec = false; // 是否执行

  // 执行任务
  for (const param of Object.keys(paramMap)) {
    switch (param) {
      case "devel":
      case "development":
        // process.env.NODE_ENV = "development";
        delete paramMap[param];
        break;
      case "prod":
      case "production":
        // process.env.NODE_ENV = "production";
        delete paramMap[param];
        break;
      case "h":
      case "help":
        isExec = true;
        delete paramMap[param];
        showHelp();
        break;
      case "v":
      case "version":
        isExec = true;
        delete paramMap[param];
        showVersion();
        break;
      case "start":
        isExec = true;
        delete paramMap[param];
        startHttpd();
        scssRender(); // 监测无css文件时再生成文件
        if (paramMap.watch) { watchPath(); }
        break;
      case "renderCSS":
        isExec = true;
        delete paramMap[param];
        scssRender(); // 渲染生成CSS文件
        break;
      case "copyJS":
        isExec = true;
        delete paramMap[param];
        import("./utils/copyJS.mjs").then(m => m.copyJS).then(fn => fn([
          path.join(paths.NODE_MODULES, "react", "umd", "react.development.js"),
          path.join(paths.NODE_MODULES, "react", "umd", "react.production.min.js"),
          path.join(paths.NODE_MODULES, "react-dom", "umd", "react-dom.development.js"),
          path.join(paths.NODE_MODULES, "react-dom", "umd", "react-dom.production.min.js"),
        ]));
        break;
      case "stop":
        isExec = true;
        delete paramMap[param];
        stopHttpd();
        break;
      case "restart":
        isExec = true;
        delete paramMap[param];
        restartHttpd();
        break;
    } // end of switch
  } // end of for loop

  if (isExec === false) {
    Object.keys(paramMap).forEach((p) => {
      console.warn("param %s is not supported by erpd.", p);
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
    paths.APPS,
    paths.SERVER,
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
    path.join(paths.SERVER, "cluster.mjs"),
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
