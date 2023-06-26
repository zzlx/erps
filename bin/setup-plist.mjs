/**
 * *****************************************************************************
 * 
 * Plist Object
 *
 * *****************************************************************************
 */

import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { paths } from '../server/settings/paths.mjs';
import { Plist } from '../server/utils.lib.mjs';

// only for mac osx system
assert (os.platform() === 'darwin', 'Must be in Mac OS X system.')
//
const plist = new Plist({
  Program: 'teset',
}).toString();

console.log(plist);
