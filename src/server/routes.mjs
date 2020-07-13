/**
 * *****************************************************************************
 *
 * 服务器端路由配置
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import Router from './kernel/Router.mjs';

const debug = util.debuglog('debug:routes'); // debug function

export default function routes () {

  return (ctx, next) => {

    ctx.body = {test: 'ttt'};
  }
} 
