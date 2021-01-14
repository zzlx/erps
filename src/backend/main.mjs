#!/usr/bin/env node --trace-warnings
/**
 * *****************************************************************************
 * 
 * ERP services daemon
 *
 * *****************************************************************************
 */

import assert from 'assert';
import cluster from 'cluster';
import cp from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

import { argvParser, console, } from '../src/utils.lib.mjs';
import debuglog from '../src/services/utils/debuglog.mjs';
import settings from '../src/settings/index.mjs';
import Http2Server from '../src/services/Http2Server.mjs';
import PathWatcher from '../src/services/utils/PathWatcher.mjs';

const debug = debuglog('debug:erps-daemon');
let httpd = null; // http daemon 

function start () {
  if (httpd == null) {
    httpd = new Http2Server({
      key: settings.privateKey,
      cert: settings.cert,
      passphrase: settings.passphrase, // 证书passphrase
      ticketKeys: crypto.randomBytes(48), 
    });
  }
}
