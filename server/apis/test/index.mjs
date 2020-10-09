/**
 * *****************************************************************************
 *
 * GraphqlAPI
 *
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import paths from '../../paths.mjs';

export default function logger (ctx) {
  ctx.state.noLog = true;
  ctx.type = 'text';
  const logFile = path.join(paths.LOG, 'request.log');
  ctx.body = fs.createReadStream(logFile);
}
