/**
 * *****************************************************************************
 *
 * 服务器路由
 *
 * @TODO: Bug未解决完
 *
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import Remarkable from 'remarkable';

import settings from './config/settings.mjs';
import Router from './koa/Router.mjs';
import statics from './koa/middlewares/statics.mjs';
import serverRender, { 
  HTMLTemplate as Html 
} from './koa/middlewares/serverSideRendering.mjs';

const debug = util.debuglog('debug:routes.mjs');
const paths = settings.paths;
export const routes = new Router({});


