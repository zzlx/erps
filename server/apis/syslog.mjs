/**
 * *****************************************************************************
 *
 * GraphqlAPI
 *
 *
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import settings from '../config/settings.mjs';

export default function logger (ctx, next) {
  ctx.state.noLog = true;
  const logFile = path.join(settings.paths.APP_LOG, 'request.log');
  if (!fs.existsSync(logFile)) {
    ctx.status = 404;
    return;
  }

  ctx.type = 'text';
  ctx.body = fs.createReadStream(logFile);
}
