/**
 * *****************************************************************************
 *
 * View middleware
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import util from 'util';

import ISODate from '../../utils/Date.mjs';
const debug = util.debuglog('debug:views-middleware');

export default function () {
  return async function viewsMiddleware (ctx, next) { 
  }
}
