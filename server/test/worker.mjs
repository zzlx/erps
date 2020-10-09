/**
 * *****************************************************************************
 * 
 * worker
 *
 * *****************************************************************************
 */

import {
  Worker, isMainThread, parentPort, workerData
} from 'worker_threads';

const __filename = import.meta.url.substr(7);

const { parse } = require('some-js-parsing-library');

if (isMainThread) {
  function parseJSAsync(script) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: script
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  };
} else {
  const script = workerData;
  parentPort.postMessage(parse(script));
}
