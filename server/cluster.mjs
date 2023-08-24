/**
 * *****************************************************************************
 * 
 * Cluster
 *
 * *****************************************************************************
 */

import cluster from "cluster";
import os from "os";
import process from "node:process";
import util from "util";

const debug = util.debuglog("debug:cluster");

// 启用cluster
if (cluster.isPrimary && process.env.NODE_ENV !== "development") {
  // Keep track of requests
  let numReqs = 0;

  // Fork workers.
  // @todo: 监控server负载及系统资源使用情况
  // @todo: 研究如何根据server负载及系统资源情况决定新建worker的算法
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) { 
    cluster.fork(process.env);
  }

  for (const id in cluster.workers) {

    const worker = cluster.workers[id];

    worker.on("message", msg => {
      if (msg.cmd && msg.cmd === "notifyRequest") {
        numReqs += 1;
        debug("requests", numReqs);
      }
    });

    worker.on("exit", (code, signal) => {
      if (signal) {
        debug(`worker was killed by signal: ${signal}`);
      } else if (code !== 0) {
        debug(`worker exited with error code: ${code}`);
      } else {
        debug("worker success!");
      }
    });
  }

  cluster.on("exit", (worker, code, signal) => {
    if (worker.exitedAfterDisconnect === true) {
      debug("Oh, it was just voluntary – no need to worry");
    }

    debug(`Receive signal: ${signal} 
      (pid:${worker.process.pid})Worker process died with code:${code}`);
  });

} else {
  import("./http2d.mjs");
}
