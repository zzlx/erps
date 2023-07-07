/**
 * *****************************************************************************
 *
 * Main programe
 *
 * [Server Documents](../src/doc/Server.md)
 *
 *
 * 支持特性:
 *
 *
 * *****************************************************************************
 */

import cp from "node:child_process";
import path from "node:path";
import util from "node:util";
import { argvParser, debounceAlgorithm } from "./utils/index.mjs";
import { paths } from "./settings/index.mjs";
import { scssRender } from "./utils/scssRender.mjs";
import { sendCommand } from "./sendCommand.mjs";
import { CLEAR_PAGE } from "./constants.mjs";

const __filename = import.meta.url.substr(7);
const __dirname = path.dirname(__filename);
const debug = util.debuglog("debug:main");
const argvs = Array.prototype.slice.call(process.argv, 2);
const paramMap = argvParser(argvs);

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

  for (const param of Object.keys(paramMap)) {
    switch (param) {
      case "devel":
      case "development":
        delete paramMap[param];
        break;
      case "h":
      case "help":
        isExec = true;
        delete paramMap[param];
        import("./help.mjs").then(m => m.help());
        break;
      case "v":
      case "version":
        isExec = true;
        delete paramMap[param];
        import("./version.mjs").then(m => m.version());
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
    debug("Restart httpd....");
    // debug("Restart service.");
    // sendCommand("RESTART");
    restartHttpd();

    // startHttpd(); // 由httpd进程自主控制重启
  }, 1000); // 每1000ms内仅重启1次

  const watcher = new PathWatcher([
    paths.SERVER,
    paths.SRC,
    paths.UIS,
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
    } else if (/\.ts$/.test(f)) {
      tsc();
    } else if (/\.scss/.test(f)) {
      scssRender();
    }
  });
}

/**
 *
 *
 */

function tsc () {
  debug("执行tsc");
  cp.exec("tsc", (err, stdout, stderr) => {
    if (err) debug("err:", err);
    debug("stdout:", stdout);
    if (stderr) debug("stderr:", stderr);
  });
}

/**
 * start http daemon
 */

function startHttpd () {
  const args = [
    path.join(__dirname, "utils", "http2d.mjs"),
  ];

  proc.httpd = cp.spawn(process.argv[0], args, {
    // keep running when the main process is exit
    // 若设置为true，后台服务无法重启
    detached: false,
    stdio: [0, 1, 2, null],
  });
}

/**
 * Eslint 
 */

function eslint (file) {
  cp.exec(`npx eslint ${file}`, (error, stdout, stderr) => {
    if (error)  console.error(error);
    if (stderr) console.error(stderr);
    if (stdout) console.log(CLEAR_PAGE, stdout); // eslint-disable-line
  });
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
    // debug("发送SIGTSTP信号给http服务");
    debug("Send SIGTERM to HTTPD.");
    proc.httpd.kill("SIGTERM");
  } else {
    debug("Send RESTART to HTTPD.");
    sendCommand("RESTART");
  }

  startHttpd();
}
