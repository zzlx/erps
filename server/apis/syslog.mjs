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
import settings from '../../config/settings.mjs';

export default function logger (ctx) {
  ctx.state.noLog = true;
  ctx.type = 'text';
  const logFile = path.join(settings.paths.LOG, 'request.log');
  ctx.body = fs.createReadStream(logFile);
}
